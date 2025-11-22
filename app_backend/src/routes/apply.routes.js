import { Router } from "express";
import { partnerApply, driverApply } from "../controllers/apply.controller.js";

const r = Router();

// Frontend expects these exact endpoints
r.post("/api/partners/apply", partnerApply);
r.post("/api/driver/apply", driverApply);

// Also support new non-/api prefixed endpoints for forward compatibility
r.post("/partner/apply", partnerApply);
r.post("/driver/apply", driverApply);

// Additional aliases for tests
r.post("/applications/partner", partnerApply);
r.post("/applications/driver", driverApply);

export default r;