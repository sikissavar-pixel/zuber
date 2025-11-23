import { createServer } from "http";
import app from "./app.js";
import { initDb, ensureAdmin } from "./config/db.js";
import { initSocket } from "./sockets/index.js";
import applyRoutes from "./routes/apply.routes.js";
import userRoutes from "./routes/user.routes.js";
import partnerRoutes from "./routes/partner.routes.js";

const PORT = parseInt(process.env.PORT || "3001", 10);

const httpServer = createServer(app);
const io = initSocket(httpServer);
app.set("io", io);

// Route'ları bağla
app.use("/api/applications", applyRoutes);
console.log("Route yüklendi: /api/applications");

app.use("/api/users", userRoutes);
console.log("Route yüklendi: /api/users");

app.use("/api/partners", partnerRoutes);
console.log("Route yüklendi: /api/partners");

initDb()
  .then(() => ensureAdmin())
  .then(() => {
    httpServer.listen(PORT, () => {
      console.log("🚀 Zuber Backend running on PORT:", PORT);
    });
  })
  .catch(console.error);