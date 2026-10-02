"""
SIH26120 Demo Data Seeding Script
Populates the database with 12 distinct synthetic wells,
180 days of physics-consistent telemetry, CSS cycles, and baseline audit logs.
Idempotent: skips if wells are already seeded.
"""

import sys
from pathlib import Path
from datetime import datetime

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.core.database import SessionLocal, init_db
from app.models.db_models import Well, Telemetry, CSSCycle, AuditEvent
from app.ml.dataset_generator import SyntheticDatasetGenerator


def seed_database():
    """Seed the database with complete synthetic demonstration data."""
    init_db()
    db = SessionLocal()

    try:
        existing_wells = db.query(Well).count()
        if existing_wells > 0:
            print(f"Database already contains {existing_wells} wells. Skipping seeding.")
            return

        print("Generating synthetic demo fleet and historical telemetry...")
        gen = SyntheticDatasetGenerator(random_seed=42)
        wells_df, telemetry_df, css_df = gen.generate_full_historical_telemetry(days_history=180)

        # 1. Insert Wells
        print(f"Inserting {len(wells_df)} wells...")
        for _, row in wells_df.iterrows():
            well = Well(
                well_code=row["well_code"],
                name=row["name"],
                archetype=row["archetype"],
                field=row["field"],
                reservoir_name=row["reservoir_name"],
                measured_depth_m=row["measured_depth_m"],
                pump_depth_m=row["pump_depth_m"],
                api_gravity=row["api_gravity"],
                base_temperature_c=row["base_temperature_c"],
                base_pressure_bar=row["base_pressure_bar"],
                permeability_md=row["permeability_md"],
                net_pay_m=row["net_pay_m"],
                tubing_id_mm=row["tubing_id_mm"],
                rod_diameter_mm=row["rod_diameter_mm"],
                pump_bore_mm=row["pump_bore_mm"],
                base_water_cut=row["base_water_cut"],
                status=row["status"],
                data_status="SYNTHETIC / DEMO"
            )
            db.add(well)
        db.commit()

        # 2. Insert CSS Cycles
        print(f"Inserting {len(css_df)} CSS cycles...")
        for _, row in css_df.iterrows():
            css = CSSCycle(
                well_code=row["well_code"],
                cycle_number=int(row["cycle_number"]),
                start_at=datetime.fromisoformat(row["start_at"]),
                steam_mass_tonnes=row["steam_mass_tonnes"],
                injection_pressure_bar=row["injection_pressure_bar"],
                steam_quality=row["steam_quality"],
                injection_duration_days=row["injection_duration_days"],
                soak_duration_days=row["soak_duration_days"],
                production_duration_days=row["production_duration_days"],
                source_type="SYNTHETIC"
            )
            db.add(css)
        db.commit()

        # 3. Insert Telemetry (batch insert for performance)
        print(f"Inserting {len(telemetry_df)} telemetry points...")
        telemetry_objs = []
        for _, row in telemetry_df.iterrows():
            t = Telemetry(
                well_code=row["well_code"],
                timestamp=datetime.fromisoformat(row["timestamp"]),
                source_type="SYNTHETIC",
                stage=row["stage"],
                temperature_c=row["temperature_c"],
                viscosity_cp=row["viscosity_cp"],
                reservoir_pressure_bar=row["reservoir_pressure_bar"],
                flowing_bhp_bar=row["flowing_bhp_bar"],
                oil_rate_bopd=row["oil_rate_bopd"],
                water_rate_bwpd=row["water_rate_bwpd"],
                stroke_in=row["stroke_in"],
                spm=row["spm"],
                vfd_hz=row["vfd_hz"],
                pprl_kn=row["pprl_kn"],
                mprl_kn=row["mprl_kn"],
                drag_force_kn=row["drag_force_kn"],
                floating_margin_kn=row["floating_margin_kn"],
                pump_efficiency_pct=row["pump_efficiency_pct"],
                energy_kwh=row["energy_kwh"],
                sor=row["sor"],
                overall_risk_score=row["overall_risk_score"],
                overall_risk_tier=row["overall_risk_tier"]
            )
            telemetry_objs.append(t)
        db.bulk_save_objects(telemetry_objs)
        db.commit()

        # 4. Insert Initial Audit Log
        initial_audit = AuditEvent(
            actor="SYSTEM_INIT",
            role="SYSTEM",
            action="INITIALIZE_SYNTHETIC_DATABASE",
            entity_type="FLEET",
            entity_id="BAGHEWALA_SYNTH_V1",
            before_json=None,
            after_json={"wells_count": len(wells_df), "telemetry_count": len(telemetry_df)},
            result="SUCCESS"
        )
        db.add(initial_audit)
        db.commit()

        print("Database seeding completed successfully!")
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
