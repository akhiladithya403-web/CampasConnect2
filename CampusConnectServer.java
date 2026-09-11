import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.*;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;

/**
 * CampusConnect AI - Standalone Java Backend Server
 * 
 * Runs with standard Java 11+ / Java 26 SE:
 *   java CampusConnectServer.java
 * or:
 *   javac CampusConnectServer.java
 *   java CampusConnectServer
 *
 * Features:
 * - Automatic port selection (tries 8080, 8081, 8082 if busy)
 * - Static file serving (HTML, CSS, JS, Images, Videos)
 * - REST APIs for Roll Number Auth, Canteen Tokens, Lost & Found, Complaints, Events
 * - Persistent JSON database storage (campus_data.json)
 */
public class CampusConnectServer {
    private static int PORT = 8080;
    private static final String WEB_ROOT = ".";
    private static final String DB_FILE = "campus_data.json";

    private static String dbCache = "{}";
    private static final Object dbLock = new Object();

    public static void main(String[] args) {
        initDatabase();

        HttpServer server = null;
        int maxAttempts = 10;
        for (int i = 0; i < maxAttempts; i++) {
            try {
                int testPort = 8080 + i;
                server = HttpServer.create(new InetSocketAddress(testPort), 0);
                PORT = testPort;
                break;
            } catch (IOException e) {
                // Port busy, try next
            }
        }

        if (server == null) {
            System.err.println("❌ Could not bind server to any port between 8080 and 8090.");
            return;
        }

        // REST API Handlers
        server.createContext("/api/status", new StatusHandler());
        server.createContext("/api/data", new DataHandler());
        server.createContext("/api/auth/login", new LoginHandler());
        server.createContext("/api/auth/register", new RegisterHandler());
        server.createContext("/api/canteen/token", new CanteenTokenHandler());
        server.createContext("/api/canteen/ready", new CanteenReadyHandler());
        server.createContext("/api/lostfound/report", new LostFoundHandler());
        server.createContext("/api/complaints/report", new ComplaintHandler());
        server.createContext("/api/complaints/upvote", new UpvoteHandler());
        server.createContext("/api/events/register", new EventRegisterHandler());
        server.createContext("/api/mailbox/read", new MailReadHandler());

        // Static File Server
        server.createContext("/", new StaticFileHandler(WEB_ROOT));

        server.setExecutor(null);
        server.start();

        System.out.println("==================================================================");
        System.out.println("🎓 CampusConnect AI - Full-Stack Java Backend Server Running!");
        System.out.println("==================================================================");
        System.out.println("👉 Access in Browser: http://localhost:" + PORT);
        System.out.println("👉 In VS Code: Click link above or open http://localhost:" + PORT);
        System.out.println("📁 Root Directory   : " + new File(WEB_ROOT).getAbsolutePath());
        System.out.println("💾 Database File    : " + new File(DB_FILE).getAbsolutePath());
        System.out.println("⚡ Technology Stack : Java SE + HTML5 + CSS + JavaScript");
        System.out.println("💡 Press Ctrl+C to stop the server.");
        System.out.println("==================================================================");

        // Try opening browser automatically
        try {
            if (System.getProperty("os.name").toLowerCase().contains("win")) {
                new ProcessBuilder("rundll32", "url.dll,FileProtocolHandler", "http://localhost:" + PORT).start();
            }
        } catch (Exception ignored) {}
    }

    private static void initDatabase() {
        synchronized (dbLock) {
            try {
                File file = new File(DB_FILE);
                if (file.exists()) {
                    dbCache = Files.readString(file.toPath(), StandardCharsets.UTF_8);
                } else {
                    File fallbackData = new File("data/campus_database.json");
                    if (fallbackData.exists()) {
                        dbCache = Files.readString(fallbackData.toPath(), StandardCharsets.UTF_8);
                    } else {
                        dbCache = createDefaultDatabaseJson();
                    }
                    saveDatabase();
                }
            } catch (Exception e) {
                dbCache = createDefaultDatabaseJson();
            }
        }
    }

    private static void saveDatabase() {
        synchronized (dbLock) {
            try {
                Files.writeString(Paths.get(DB_FILE), dbCache, StandardCharsets.UTF_8);
            } catch (Exception e) {
                System.err.println("Error writing database: " + e.getMessage());
            }
        }
    }

    private static String createDefaultDatabaseJson() {
        return "{\n" +
               "  \"users\": [\n" +
               "    {\"email\": \"arunkumar.student@college.edu\", \"phone\": \"9876543210\", \"password\": \"password123\", \"profile\": {\"id\": \"usr_2026_01\", \"fullName\": \"Arun Kumar\", \"email\": \"arunkumar.student@college.edu\", \"phone\": \"9876543210\", \"department\": \"Computer Science & Engineering\", \"rollNo\": \"22CS108\", \"year\": \"3rd Year\", \"avatar\": \"https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80\", \"joinedDate\": \"August 2024\"}}\n" +
               "  ],\n" +
               "  \"canteenTokens\": [],\n" +
               "  \"lostFound\": [],\n" +
               "  \"issues\": [],\n" +
               "  \"mailbox\": []\n" +
               "}";
    }

    private static String readBody(HttpExchange exchange) throws IOException {
        try (InputStream is = exchange.getRequestBody();
             ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            byte[] buf = new byte[4096];
            int n;
            while ((n = is.read(buf)) != -1) {
                baos.write(buf, 0, n);
            }
            return baos.toString(StandardCharsets.UTF_8);
        }
    }

    private static void sendJson(HttpExchange exchange, int code, String json) throws IOException {
        byte[] data = json.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization");
        exchange.sendResponseHeaders(code, data.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(data);
        }
    }

    private static void handleCors(HttpExchange exchange) throws IOException {
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization");
        exchange.sendResponseHeaders(204, -1);
    }

    private static String extractString(String json, String key) {
        if (json == null) return "";
        String search = "\"" + key + "\"";
        int idx = json.indexOf(search);
        if (idx == -1) return "";
        int colon = json.indexOf(':', idx + search.length());
        if (colon == -1) return "";
        int quoteStart = json.indexOf('"', colon + 1);
        if (quoteStart == -1) {
            int nextComma = json.indexOf(',', colon + 1);
            int nextBrace = json.indexOf('}', colon + 1);
            int end = json.length();
            if (nextComma != -1) end = Math.min(end, nextComma);
            if (nextBrace != -1) end = Math.min(end, nextBrace);
            return json.substring(colon + 1, end).trim();
        }
        int quoteEnd = json.indexOf('"', quoteStart + 1);
        if (quoteEnd == -1) return "";
        return json.substring(quoteStart + 1, quoteEnd);
    }

    // Handlers
    static class StatusHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) { handleCors(exchange); return; }
            sendJson(exchange, 200, "{\"status\":\"online\",\"server\":\"CampusConnect AI Java SE\",\"port\":" + PORT + "}");
        }
    }

    static class DataHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) { handleCors(exchange); return; }
            synchronized (dbLock) {
                sendJson(exchange, 200, dbCache);
            }
        }
    }

    static class LoginHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) { handleCors(exchange); return; }
            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJson(exchange, 405, "{\"success\":false,\"message\":\"Method not allowed\"}");
                return;
            }
            String body = readBody(exchange);
            String id = extractString(body, "identifier").trim().toLowerCase();
            String pwd = extractString(body, "password").trim();

            if (id.isEmpty() || pwd.isEmpty()) {
                sendJson(exchange, 400, "{\"success\":false,\"message\":\"Roll Number / Email and password required.\"}");
                return;
            }

            synchronized (dbLock) {
                // 1. Check for seeded demo student
                if ((id.equals("22cs108") || id.equals("arunkumar.student@college.edu") || id.contains("9876543210"))
                        && pwd.equals("password123")) {
                    String user = "{\"id\":\"usr_2026_01\",\"fullName\":\"Arun Kumar\",\"email\":\"arunkumar.student@college.edu\",\"phone\":\"9876543210\",\"department\":\"Computer Science & Engineering\",\"rollNo\":\"22CS108\",\"year\":\"3rd Year\",\"avatar\":\"https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80\",\"joinedDate\":\"August 2024\"}";
                    sendJson(exchange, 200, "{\"success\":true,\"user\":" + user + "}");
                    return;
                }

                // 2. Search persistent users database
                String matchedProfile = findUserProfile(id, pwd);
                if (matchedProfile != null) {
                    sendJson(exchange, 200, "{\"success\":true,\"user\":" + matchedProfile + "}");
                    return;
                }

                sendJson(exchange, 401, "{\"success\":false,\"message\":\"Invalid Roll Number, Email, or Password. Please try again or click 'Demo Student Login'.\"}");
            }
        }
    }

    private static String findUserProfile(String id, String pwd) {
        try {
            int usersIdx = dbCache.indexOf("\"users\":");
            if (usersIdx == -1) return null;
            int arrStart = dbCache.indexOf('[', usersIdx);
            int arrEnd = dbCache.indexOf(']', arrStart);
            if (arrStart == -1 || arrEnd == -1) return null;
            String usersStr = dbCache.substring(arrStart, arrEnd + 1);

            int cur = 0;
            while ((cur = usersStr.indexOf("{\"email\"", cur)) != -1) {
                int next = usersStr.indexOf("{\"email\"", cur + 1);
                int end = (next != -1) ? next : usersStr.length();
                String record = usersStr.substring(cur, end);

                String p = extractString(record, "password");
                if (p.equals(pwd)) {
                    String r = extractString(record, "rollNo").trim().toLowerCase();
                    String e = extractString(record, "email").trim().toLowerCase();
                    String ph = extractString(record, "phone").trim().toLowerCase();
                    if (r.equals(id) || e.equals(id) || (!ph.isEmpty() && ph.equals(id))) {
                        int pStart = record.indexOf("\"profile\":");
                        if (pStart != -1) {
                            int b1 = record.indexOf('{', pStart);
                            int b2 = record.indexOf('}', b1);
                            if (b1 != -1 && b2 != -1) {
                                return record.substring(b1, b2 + 1);
                            }
                        }
                    }
                }
                if (next == -1) break;
                cur = next;
            }
        } catch (Exception ignored) {}
        return null;
    }

    static class RegisterHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) { handleCors(exchange); return; }
            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJson(exchange, 405, "{\"success\":false,\"message\":\"Method not allowed\"}");
                return;
            }
            String body = readBody(exchange);
            String fullName = extractString(body, "fullName").trim();
            String rollNo = extractString(body, "rollNo").trim().toUpperCase();
            String identifier = extractString(body, "identifier").trim();
            String password = extractString(body, "password").trim();
            String dept = extractString(body, "department").trim();
            String year = extractString(body, "year").trim();

            if (fullName.isEmpty() || rollNo.isEmpty() || password.isEmpty()) {
                sendJson(exchange, 400, "{\"success\":false,\"message\":\"Full Name, Roll Number, and Password are required.\"}");
                return;
            }

            synchronized (dbLock) {
                if (dbCache.contains("\"rollNo\":\"" + rollNo + "\"")) {
                    sendJson(exchange, 409, "{\"success\":false,\"message\":\"Roll Number " + rollNo + " is already registered.\"}");
                    return;
                }

                String email = identifier.contains("@") ? identifier : rollNo.toLowerCase() + "@college.edu";
                String avatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80";

                String profileJson = "{\"id\":\"usr_" + System.currentTimeMillis() + "\",\"fullName\":\"" + fullName + "\",\"email\":\"" + email + "\",\"phone\":\"\",\"department\":\"" + dept + "\",\"rollNo\":\"" + rollNo + "\",\"year\":\"" + year + "\",\"avatar\":\"" + avatar + "\",\"joinedDate\":\"September 2026\"}";

                // Append to users
                int uIdx = dbCache.indexOf("\"users\": [");
                if (uIdx != -1) {
                    int pos = uIdx + "\"users\": [".length();
                    String record = "{\"email\":\"" + email + "\",\"password\":\"" + password + "\",\"profile\":" + profileJson + "},";
                    dbCache = dbCache.substring(0, pos) + "\n    " + record + dbCache.substring(pos);
                    saveDatabase();
                }

                sendJson(exchange, 201, "{\"success\":true,\"user\":" + profileJson + "}");
            }
        }
    }

    static class CanteenTokenHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) { handleCors(exchange); return; }
            String body = readBody(exchange);
            synchronized (dbLock) {
                int idx = dbCache.indexOf("\"canteenTokens\": [");
                if (idx != -1) {
                    int pos = idx + "\"canteenTokens\": [".length();
                    dbCache = dbCache.substring(0, pos) + "\n    " + body + "," + dbCache.substring(pos);
                    saveDatabase();
                }
            }
            sendJson(exchange, 200, "{\"success\":true,\"message\":\"Token recorded in Java backend.\"}");
        }
    }

    static class CanteenReadyHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) { handleCors(exchange); return; }
            String body = readBody(exchange);
            String tokenId = extractString(body, "id");
            synchronized (dbLock) {
                if (dbCache.contains(tokenId)) {
                    dbCache = dbCache.replace("\"status\": \"Preparing\"", "\"status\": \"Ready\"");
                    saveDatabase();
                }
            }
            sendJson(exchange, 200, "{\"success\":true,\"status\":\"Ready\"}");
        }
    }

    static class LostFoundHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) { handleCors(exchange); return; }
            String body = readBody(exchange);
            synchronized (dbLock) {
                int idx = dbCache.indexOf("\"lostFound\": [");
                if (idx != -1) {
                    int pos = idx + "\"lostFound\": [".length();
                    dbCache = dbCache.substring(0, pos) + "\n    " + body + "," + dbCache.substring(pos);
                    saveDatabase();
                }
            }
            sendJson(exchange, 201, "{\"success\":true,\"message\":\"Lost/Found item saved.\"}");
        }
    }

    static class ComplaintHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) { handleCors(exchange); return; }
            String body = readBody(exchange);
            synchronized (dbLock) {
                int idx = dbCache.indexOf("\"issues\": [");
                if (idx != -1) {
                    int pos = idx + "\"issues\": [".length();
                    dbCache = dbCache.substring(0, pos) + "\n    " + body + "," + dbCache.substring(pos);
                    saveDatabase();
                }
            }
            sendJson(exchange, 201, "{\"success\":true,\"message\":\"Complaint registered.\"}");
        }
    }

    static class UpvoteHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) { handleCors(exchange); return; }
            sendJson(exchange, 200, "{\"success\":true,\"message\":\"Upvoted.\"}");
        }
    }

    static class EventRegisterHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) { handleCors(exchange); return; }
            sendJson(exchange, 200, "{\"success\":true,\"message\":\"Pass generated.\"}");
        }
    }

    static class MailReadHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) { handleCors(exchange); return; }
            String body = readBody(exchange);
            String mailId = extractString(body, "id");
            synchronized (dbLock) {
                if (dbCache.contains(mailId)) {
                    dbCache = dbCache.replace("\"read\": false", "\"read\": true");
                    saveDatabase();
                }
            }
            sendJson(exchange, 200, "{\"success\":true}");
        }
    }

    // Static File Server
    static class StaticFileHandler implements HttpHandler {
        private final String root;

        public StaticFileHandler(String root) { this.root = root; }

        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) { handleCors(exchange); return; }

            String path = exchange.getRequestURI().getPath();
            if (path == null || path.equals("/") || path.isEmpty()) {
                path = "/index.html";
            }

            File file = new File(root, path).getCanonicalFile();
            File rootFile = new File(root).getCanonicalFile();

            if (!file.getPath().startsWith(rootFile.getPath()) || !file.exists() || file.isDirectory()) {
                String response = "404 Not Found";
                exchange.sendResponseHeaders(404, response.length());
                try (OutputStream os = exchange.getResponseBody()) { os.write(response.getBytes()); }
                return;
            }

            String contentType = Files.probeContentType(file.toPath());
            if (contentType == null) {
                if (path.endsWith(".css")) contentType = "text/css; charset=UTF-8";
                else if (path.endsWith(".js")) contentType = "application/javascript; charset=UTF-8";
                else if (path.endsWith(".html")) contentType = "text/html; charset=UTF-8";
                else if (path.endsWith(".json")) contentType = "application/json; charset=UTF-8";
                else if (path.endsWith(".svg")) contentType = "image/svg+xml";
                else if (path.endsWith(".png")) contentType = "image/png";
                else if (path.endsWith(".jpg") || path.endsWith(".jpeg")) contentType = "image/jpeg";
                else if (path.endsWith(".mp4")) contentType = "video/mp4";
                else contentType = "application/octet-stream";
            }

            exchange.getResponseHeaders().set("Content-Type", contentType);
            exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
            exchange.sendResponseHeaders(200, file.length());

            try (FileInputStream fis = new FileInputStream(file);
                 OutputStream os = exchange.getResponseBody()) {
                byte[] buffer = new byte[16384];
                int n;
                while ((n = fis.read(buffer)) != -1) {
                    os.write(buffer, 0, n);
                }
            }
        }
    }
}
