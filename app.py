import os
import joblib # type: ignore
import numpy as np
import pandas as pd # type: ignore
import torch # type: ignore
from flask import Flask, render_template, request, jsonify # type: ignore
from pytorch_tabnet.tab_model import TabNetClassifier # type: ignore

# ---------- LOAD ARTIFACTS ----------
model_lgb = joblib.load("model_lgb.pkl")
model_dynaboost = joblib.load("model_dynaboost.pkl")
scaler = joblib.load("scaler.pkl")
selector = joblib.load("selector.pkl")
feature_names = joblib.load("feature_names.pkl")
encoders = joblib.load("encoders.pkl")
selected_feature_names = joblib.load("selected_feature_names.pkl")

# TabNet load
model_tabnet = TabNetClassifier()
model_tabnet.load_model("model_tabnet.zip")

# ---------- HELPERS ----------
def tie_breaker_most_common(preds):
    from collections import Counter
    cnt = Counter(preds)
    most = cnt.most_common()
    top_count = most[0][1]
    top_classes = [c for c, ct in most if ct == top_count]
    if len(top_classes) == 1:
        return top_classes[0]
    return max(top_classes)

def rule_based_upgrade(user_row_dict):
    flags = 0
    wi = str(user_row_dict.get("work_interfere", "")).lower()
    leave = str(user_row_dict.get("leave", "")).lower()
    if wi in ["often", "always"]:
        flags += 1
    if leave in ["very difficult", "somewhat difficult"]:
        flags += 1
    if str(user_row_dict.get("mental_health_consequence", "")).lower() in ["yes","y","true"]:
        flags += 1
    if str(user_row_dict.get("phys_health_consequence", "")).lower() in ["yes","y","true"]:
        flags += 1
    if str(user_row_dict.get("family_history", "")).lower() in ["yes","y","true"]:
        flags += 1
    return flags >= 2

def preprocess_user_input(user_dict, encoders_obj, feature_order, scaler_obj, selector_obj):
    df_u = pd.DataFrame([user_dict])
    for col, le in encoders_obj.items():
        if col in df_u:
            val = df_u[col].iloc[0]
            try:
                df_u[col] = le.transform([str(val)])
            except Exception:
                if "Unknown" in le.classes_:
                    df_u[col] = le.transform(["Unknown"])
                else:
                    le.classes_ = np.append(le.classes_, str(val))
                    df_u[col] = le.transform([str(val)])
    for c in feature_order:
        if c not in df_u:
            df_u[c] = 0
    df_u = df_u[feature_order]
    Xs = scaler_obj.transform(df_u)
    Xs_sel = selector_obj.transform(Xs)
    return Xs_sel

def predict_from_user_input(user_dict, do_override=True):
    Xu = preprocess_user_input(user_dict, encoders, feature_names, scaler, selector)
    p1 = int(model_lgb.predict(Xu)[0])
    p2 = int(model_dynaboost.predict(Xu)[0])
    p3 = int(model_tabnet.predict(Xu.astype(np.float32))[0])
    preds = [p1, p2, p3]
    final = tie_breaker_most_common(preds)
    if do_override and rule_based_upgrade(user_dict):
        final = max(final, 2)

    stress_map = {0: "No Stress", 1: "Mild Stress", 2: "High Stress"}
    treatment_map = {0: "Maintain Your Current Well Being", 1: "Preventive Measures Required", 2: "Structured Therapeutic Plan Needed"}
    suggestions = {
        0: [
            "Maintain regular physical activity (walking, yoga).",
            "Stay socially connected and keep a healthy routine.",
            "Continue positivity practices (journaling, hobby time)."
        ],
        1: [
            "Practice short daily relaxation (breathing, stretching, music).",
            "Balance work and rest; take short micro-breaks during work.",
            "Talk with a trusted person and track triggers."
        ],
        2: [
            "Prioritize rest and reduce unnecessary workload.",
            "Break large tasks into smaller achievable goals.",
            "Engage in supportive conversations with family/friends.",
            "Practice mindfulness, guided breathing, or creative outlets."
        ]
    }
    extra = {
        0: ["✔ Stay hydrated.", "✔ Maintain sleep consistency.", "✔ Plan weekly goals."],
        1: ["✔ Reduce late-night screens.", "✔ Keep a stress diary.", "✔ Try light hobbies."],
        2: ["✔ Fixed sleep schedule & limited caffeine.", "✔ Structured relaxation (guided meditation).", "✔ Ensure nutrition & hydration."]
    }
    return {
        "Stress Level": stress_map[final],
        "Treatment": treatment_map[final],
        "Suggestions": suggestions[final],
        "Extra Tips": extra[final]
    }

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/predict", methods=["POST"])
def api_predict():
    data = request.json
    out = predict_from_user_input(data)
    return jsonify(out)

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=8000, debug=True)
