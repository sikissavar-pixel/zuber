import { createServer } from "http";
import app from "./app.js";
import { initDb } from "./config/db.js";
import { initSocket } from "./sockets/index.js";

const PORT = parseInt(process.env.PORT || "8080", 10);

const httpServer = createServer(app);
const io = initSocket(httpServer);
app.set("io", io);

initDb().then(() => {
  httpServer.listen(PORT, () => {
    console.log("🚀 Zuber Backend running on PORT:", PORT);
  });
});