import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.file.Files;

/**
 * Campus Fix AI - Standalone Zero-Dependency Web Server
 * Runs locally on Java 26 / Java 11+ to serve Campus Fix AI static files.
 */
public class WebServer {
    private static final int PORT = 8080;
    private static final String ROOT_DIR = ".";

    public static void main(String[] args) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);
        server.createContext("/", new StaticFileHandler(ROOT_DIR));
        server.setExecutor(null); // default executor
        System.out.println("=================================================");
        System.out.println("🚀 CampusConnect AI Server Running!");
        System.out.println("👉 Access at: http://localhost:" + PORT);
        System.out.println("Press Ctrl+C to stop the server.");
        System.out.println("=================================================");
        server.start();
    }

    static class StaticFileHandler implements HttpHandler {
        private final String root;

        public StaticFileHandler(String root) {
            this.root = root;
        }

        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String path = exchange.getRequestURI().getPath();
            if (path == null || path.equals("/") || path.isEmpty()) {
                path = "/index.html";
            }

            File file = new File(root, path).getCanonicalFile();
            File rootFile = new File(root).getCanonicalFile();

            // Prevent path traversal
            if (!file.getPath().startsWith(rootFile.getPath()) || !file.exists() || file.isDirectory()) {
                String response = "404 Not Found";
                exchange.sendResponseHeaders(404, response.length());
                try (OutputStream os = exchange.getResponseBody()) {
                    os.write(response.getBytes());
                }
                return;
            }

            String contentType = Files.probeContentType(file.toPath());
            if (contentType == null) {
                if (path.endsWith(".css")) contentType = "text/css";
                else if (path.endsWith(".js")) contentType = "application/javascript";
                else if (path.endsWith(".html")) contentType = "text/html";
                else if (path.endsWith(".json")) contentType = "application/json";
                else contentType = "application/octet-stream";
            }

            exchange.getResponseHeaders().set("Content-Type", contentType);
            exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
            exchange.sendResponseHeaders(200, file.length());

            try (FileInputStream fis = new FileInputStream(file);
                 OutputStream os = exchange.getResponseBody()) {
                byte[] buffer = new byte[8192];
                int bytesRead;
                while ((bytesRead = fis.read(buffer)) != -1) {
                    os.write(buffer, 0, bytesRead);
                }
            }
        }
    }
}
