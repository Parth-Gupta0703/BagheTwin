# 11 — Constrained Multi-Objective Optimization & Explainability

## 1. Decision Variables & Constraints
The joint optimizer simultaneously tunes CSS and SRP controls:
* **CSS:** Steam slug mass (600–2,000 t), Injection pressure (50–100 bar), Soak days (2–14 d).
* **SRP:** Polished rod stroke length (64–168 in), Pumping speed (2.0–10.5 SPM), VFD frequency.

### Hard Safety Constraints (Prior-to-Ranking Filtering)
Candidates are immediately rejected if:
1. $P_{\text{inj}} > 100\text{ bar}$ (Fracture pressure safety limit)
2. $\text{Floating Margin} < 2.0\text{ kN}$ (Critical rod-float and carrier-bar separation floor)
3. $\text{Rod Tensile Stress} > 80\%$ of material endurance limit
4. $\text{Pump Fillage} < 50\%$ (Severe pump starvation / fluid pound)

## 2. Multi-Objective Objective Function
$$\text{Score} = w_{\text{oil}} \cdot U_{\text{oil}} + w_{\text{SOR}} \cdot U_{\text{SOR}} + w_{\text{energy}} \cdot U_{\text{energy}} + w_{\text{risk}} \cdot U_{\text{risk}}$$

The optimizer identifies non-dominated Pareto solutions and recommends the knee-point balance.

## 3. Grounded Explainability
Recommendations are accompanied by deterministic engineering explanations generated directly from physical state diffs (e.g., how shifting to 144" stroke and 4.8 SPM restores floating margin by +3.80 kN while increasing oil recovery by +8.7 BOPD).
