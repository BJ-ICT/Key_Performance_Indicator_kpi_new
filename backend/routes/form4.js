// routes/form4.js
import express from "express";
import Form4 from "../models/form4.js";

const router = express.Router();

// helper: normalize an incoming areas object (keys -> UPPERCASE, numbers)
const normalizeAreas = (obj = {}) => {
  const out = {};
  Object.entries(obj).forEach(([k, v]) => {
    const key = String(k || "").toUpperCase().trim();
    if (!key) return;
    const num = typeof v === "string" ? parseFloat(v) : Number(v);
    out[key] = Number.isFinite(num) ? num : 0;
  });
  return out;
};

// helper: extract legacy top-level area fields from body into areas map
const pickLegacyAreasFromBody = (body = {}) => {
  const areas = {};
  Object.keys(body).forEach((k) => {
    // Heuristic: treat ALL ALLCAPS keys as area codes (CENHKMD, GQKINTB, etc.)
    if (/^[A-Z0-9]+$/.test(k)) {
      const num = typeof body[k] === "string" ? parseFloat(body[k]) : Number(body[k]);
      areas[k] = Number.isFinite(num) ? num : 0;
    }
  });
  return areas;
};

// CREATE
router.post("/add", async (req, res) => {
  try {
    const {
      no,
      kpi,
      target,
      calculation,
      platform,
      responsibledgm,
      definedoladetails,
      weightage,
      datasources,
      areas: areasBody,
      ...rest // legacy area fields may be here (CENHKMD, etc.)
    } = req.body || {};

    const areas = {
      ...normalizeAreas(areasBody),
      ...normalizeAreas(pickLegacyAreasFromBody(rest)),
    };

    const doc = await Form4.create({
      no,
      kpi,
      target,
      calculation,
      platform,
      responsibledgm,
      definedoladetails,
      weightage,
      datasources,
      areas,
    });

    res.json({ message: "form4 Added", id: doc._id });
  } catch (err) {
    console.error("POST /form4/add error:", err);
    res.status(500).json({ error: "Failed to add form4" });
  }
});

// READ ALL
router.get("/", async (_req, res) => {
  try {
    const docs = await Form4.find().lean();

    // Flatten areas back to top-level fields for backward compatibility
    const withFlattened = docs.map((d) => {
      const out = { ...d };
      if (d.areas && typeof d.areas === "object") {
        Object.entries(d.areas).forEach(([k, v]) => {
          out[k] = v;
        });
      }
      return out;
    });

    res.json(withFlattened);
  } catch (err) {
    console.error("GET /form4 error:", err);
    res.status(500).json({ error: "Failed to fetch form4" });
  }
});

// READ ONE
router.get("/get/:id", async (req, res) => {
  try {
    const doc = await Form4.findById(req.params.id).lean();
    if (!doc) return res.status(404).json({ error: "Not found" });

    const out = { ...doc };
    if (doc.areas && typeof doc.areas === "object") {
      Object.entries(doc.areas).forEach(([k, v]) => {
        out[k] = v;
      });
    }
    res.json({ status: "user fetched", user: out });
  } catch (err) {
    console.error("GET /form4/get/:id error:", err);
    res.status(500).json({ error: "Failed to fetch form4 item" });
  }
});

// UPDATE
router.put("/update/:id", async (req, res) => {
  try {
    const {
      no,
      kpi,
      target,
      calculation,
      platform,
      responsibledgm,
      definedoladetails,
      weightage,
      datasources,
      areas: areasBody,
      ...rest
    } = req.body || {};

    // merge incoming areas (either in 'areas' or legacy fields)
    const incomingAreas = {
      ...normalizeAreas(areasBody),
      ...normalizeAreas(pickLegacyAreasFromBody(rest)),
    };

    // build update object
    const update = {
      ...(no !== undefined && { no }),
      ...(kpi !== undefined && { kpi }),
      ...(target !== undefined && { target }),
      ...(calculation !== undefined && { calculation }),
      ...(platform !== undefined && { platform }),
      ...(responsibledgm !== undefined && { responsibledgm }),
      ...(definedoladetails !== undefined && { definedoladetails }),
      ...(weightage !== undefined && { weightage }),
      ...(datasources !== undefined && { datasources }),
    };

    // If any area keys were provided, set the whole map (replace)
    if (Object.keys(incomingAreas).length) {
      update.areas = incomingAreas;
    }

    await Form4.findByIdAndUpdate(req.params.id, update, { new: true });
    res.status(200).json({ status: "user updated" });
  } catch (err) {
    console.error("PUT /form4/update/:id error:", err);
    res.status(500).json({ status: "Error with updating data" });
  }
});

// DELETE
router.delete("/delete/:id", async (req, res) => {
  try {
    await Form4.findByIdAndDelete(req.params.id);
    res.status(200).json({ status: "user deleted" });
  } catch (err) {
    console.error("DELETE /form4/delete/:id error:", err);
    res.status(500).json({ status: "Error with delete user", error: err.message });
  }
});

export default router;
