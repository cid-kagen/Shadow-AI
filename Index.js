/**
 * @author cid-kageno
 * ! The source code is written and maintained by cid-kageno.
 * ! Official source code: (your repo link if you have)
 *
 * English:
 * ! Please do not change the below code, it is important for the project.
 * Thank you for using
 *
 * Vietnamese:
 * ! Vui lòng không thay đổi mã bên dưới, nó rất quan trọng đối với dự án.
 * Cảm ơn bạn đã sử dụng
 */

const { spawn } = require("child_process");
const log = require("./logger/log.js");
const http = require("http");

// Start HTTP server IMMEDIATELY for Render/Railway port detection
const PORT = process.env.PORT || 3001;
const server = http.createServer((req, res) => {
        if (req.url === '/uptime' || req.url === '/') {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                        status: 'online',
                        uptime: process.uptime(),
                        message: 'Bot is running'
                }));
        } else {
                res.writeHead(404);
                res.end('Not Found');
        }
});

server.listen(PORT, '0.0.0.0', () => {
        log.info("HTTP SERVER", `Port ${PORT} is open for Render/Railway`);
});

function startProject() {
        const child = spawn("node", ["Goat.js"], {
                cwd: __dirname,
                stdio: "inherit",
                shell: true,
                env: { ...process.env, SERVER_UPTIME_MANAGED: '1' }
        });

        child.on("close", (code) => {
                if (code == 2) {
                        log.info("Restarting Project...");
                        startProject();
                }
        });
}

startProject();
