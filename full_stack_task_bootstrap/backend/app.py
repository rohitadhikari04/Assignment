from flask import Flask, request, jsonify
from flask_cors import CORS
from bson import ObjectId
import os
from pymongo import MongoClient

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017")
client = MongoClient(MONGO_URI)
db = client["overlay_db"]
collection = db["overlays"]

def serialize_overlay(doc):
    return {
        "id": str(doc["_id"]),
        "name": doc.get("name"),
        "content": doc.get("content"),
        "x": doc.get("x"),
        "y": doc.get("y"),
        "width": doc.get("width"),
        "height": doc.get("height"),
        "visible": doc.get("visible", True),
        "type": doc.get("type", "text")
    }

@app.route("/api/overlays", methods=["GET"])
def list_overlays():
    docs = list(collection.find())
    return jsonify([serialize_overlay(d) for d in docs]), 200

@app.route("/api/overlays", methods=["POST"])
def create_overlay():
    data = request.json
    required = ["name", "content", "x", "y", "width", "height"]
    if not all(k in data for k in required):
        return jsonify({"error": "missing fields"}), 400
    doc = {
        "name": data["name"],
        "content": data["content"],
        "x": data["x"],
        "y": data["y"],
        "width": data["width"],
        "height": data["height"],
        "visible": data.get("visible", True),
        "type": data.get("type", "text")
    }
    res = collection.insert_one(doc)
    doc["_id"] = res.inserted_id
    return jsonify(serialize_overlay(doc)), 201

@app.route("/api/overlays/<overlay_id>", methods=["PUT"])
def update_overlay(overlay_id):
    data = request.json
    update = {}
    for key in ["name","content","x","y","width","height","visible","type"]:
        if key in data:
            update[key] = data[key]
    if not update:
        return jsonify({"error":"no fields to update"}), 400
    res = collection.update_one({"_id": ObjectId(overlay_id)}, {"$set": update})
    if res.matched_count == 0:
        return jsonify({"error":"not found"}), 404
    doc = collection.find_one({"_id": ObjectId(overlay_id)})
    return jsonify(serialize_overlay(doc)), 200

@app.route("/api/overlays/<overlay_id>", methods=["DELETE"])
def delete_overlay(overlay_id):
    res = collection.delete_one({"_id": ObjectId(overlay_id)})
    if res.deleted_count == 0:
        return jsonify({"error":"not found"}), 404
    return jsonify({"status":"deleted"}), 200

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)