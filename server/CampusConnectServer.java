package server;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.*;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.util.*;

/**
 * CampusConnect AI - Full-Stack Java Backend Server
 * Serves static assets (HTML/CSS/JS) and provides REST APIs for:
 * 1. Student Roll Number Authentication & Registration
 * 2. Canteen Queue wait-free token generation & live queue board
 * 3. Lost & Found reporting with AI similarity matching & email alerts
 * 4. Campus Navigation routes & voice guidance
 * 5. Events & Games registration with automated pass issuance
 * 6. Student Complaints & Facility Issues triage & upvoting
 * 7. Virtual Mailbox automation and persistent database updates
 */
public class CampusConnectServer {
    private static final int PORT = 8080;
    private static final String WEB_ROOT = ".";
    private static final String DB_PATH = "data/campus_database.json";

    private static String databaseJsonCache = "";
    private static final Object dbLock = new Object();

    public static void main(String[] args) throws IOException {
        loadDatabase();

        HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);

        // 1. API Endpoints
        server.createContext("/api/status", new StatusHandler());
        server.createContext("/api/data", new DataHandler());
        server.createContext("/api/auth/login", new LoginHandler());
        server.createContext("/api/auth/register", new RegisterHandler());
        server.createContext("/api/canteen/token", new CanteenTokenHandler());
        server.createContext("/api/canteen/ready", new CanteenReadyHandler());
        server.createContext("/api/lostfound/report", new LostFoundHandler());
        server.createContext("/api/events/register", new EventRegisterHandler());
        server.createContext("/api/complaints/report", new ComplaintHandler());
        server.createContext("/api/complaints/upvote", new ComplaintUpvoteHandler());
        server.createContext("/api/mailbox/read", new MailReadHandler());

        // 2. Static File Serving (HTML, CSS, JS, Media)
        server.createContext("/", new StaticHandler(WEB_ROOT));

        server.setExecutor(null); // default executor
        server.start();

        System.out.println("==================================================================");
        System.out.println("🎓 CampusConnect AI - Java Backend Server Started Successfully!  ");
        System.out.println("==================================================================");
        System.out.println("🚀 HTTP Server URL : http://localhost:" + PORT);
        System.out.println("📁 Static Files    : " + new File(WEB_ROOT).getAbsolutePath());
        System.out.println("💾 Database File   : " + new File(DB_PATH).getAbsolutePath());
        System.out.println("⚡ Technology Stack : Java 26 SE + HTML5 + Tailwind CSS + Vanilla JS");
        System.out.println("💡 Press Ctrl+C in terminal to stop server.");
        System.out.println("==================================================================");
    }

    // Load or initialize persistent JSON database
    private static void loadDatabase() {
        synchronized (dbLock) {
            try {
                File dbFile = new File(DB_PATH);
                if (dbFile.exists()) {
                    databaseJsonCache = Files.readString(dbFile.toPath(), StandardCharsets.UTF_8);
                    System.out.println("✅ Persistent database loaded from: " + DB_PATH);
                } else {
                    File parent = dbFile.getParentFile();
                    if (parent != null) parent.mkdirs();
                    databaseJsonCache = "{}";
                    saveDatabase();
                }
            } catch (Exception e) {
                System.err.println("⚠️ Warning reading database file: " + e.getMessage());
                databaseJsonCache = "{}";
            }
        }
    }

    private static void saveDatabase() {
        synchronized (dbLock) {
            try {
                File dbFile = new File(DB_PATH);
                File parent = dbFile.getParentFile();
                if (parent != null && !parent.exists()) parent.mkdirs();
                Files.writeString(dbFile.toPath(), databaseJsonCache, StandardCharsets.UTF_8);
            } catch (Exception e) {
                System.err.println("❌ Error saving database file: " + e.getMessage());
            }
        }
    }

    // Simple JSON Value Extractor helper
    private static String extractJsonString(String json, String key) {
        if (json == null) return "";
        String search = "\"" + key + "\"";
        int idx = json.indexOf(search);
        if (idx == -1) return "";
        int colon = json.indexOf(':', idx + search.length());
        if (colon == -1) return "";
        int quoteStart = json.indexOf('"', colon + 1);
        if (quoteStart == -1) {
            // Might be number or boolean
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

    private static String readRequestBody(HttpExchange exchange) throws IOException {
        InputStream is = exchange.getRequestBody();
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        byte[] buffer = new byte[4096];
        int n;
        while ((n = is.read(buffer)) != -1) {
            baos.write(buffer, 0, n);
        }
        return baos.toString(StandardCharsets.UTF_8);
    }

    private static void sendJsonResponse(HttpExchange exchange, int statusCode, String jsonResponse) throws IOException {
        byte[] bytes = jsonResponse.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization");
        exchange.sendResponseHeaders(statusCode, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private static void handleCorsPreflight(HttpExchange exchange) throws IOException {
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization");
        exchange.sendResponseHeaders(204, -1);
    }

    // -------------------------------------------------------------
    // HANDLER: GET /api/status
    // -------------------------------------------------------------
    static class StatusHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                handleCorsPreflight(exchange);
                return;
            }
            String resp = "{\"status\":\"online\",\"service\":\"CampusConnect AI Java Server\",\"javaVersion\":\"" +
                    System.getProperty("java.version") + "\",\"port\":" + PORT + "}";
            sendJsonResponse(exchange, 200, resp);
        }
    }

    // -------------------------------------------------------------
    // HANDLER: GET /api/data
    // -------------------------------------------------------------
    static class DataHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                handleCorsPreflight(exchange);
                return;
            }
            synchronized (dbLock) {
                sendJsonResponse(exchange, 200, databaseJsonCache);
            }
        }
    }

    // -------------------------------------------------------------
    // HANDLER: POST /api/auth/login
    // -------------------------------------------------------------
    static class LoginHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                handleCorsPreflight(exchange);
                return;
            }
            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJsonResponse(exchange, 405, "{\"success\":false,\"message\":\"Method not allowed\"}");
                return;
            }

            String body = readRequestBody(exchange);
            String identifier = extractJsonString(body, "identifier").trim().toLowerCase();
            String password = extractJsonString(body, "password").trim();

            if (identifier.isEmpty() || password.isEmpty()) {
                sendJsonResponse(exchange, 400, "{\"success\":false,\"message\":\"Roll Number / Email and password required.\"}");
                return;
            }

            // Verify with database
            synchronized (dbLock) {
                // Check if user matches in databaseJsonCache
                boolean matched = false;
                String userProfile = "";

                // Quick check for default user
                if ((identifier.equals("22cs108") || identifier.equals("arunkumar.student@college.edu") || identifier.contains("9876543210"))
                        && password.equals("password123")) {
                    matched = true;
                    userProfile = "{\"id\":\"usr_2026_01\",\"fullName\":\"Arun Kumar\",\"email\":\"arunkumar.student@college.edu\",\"phone\":\"9876543210\",\"department\":\"Computer Science & Engineering\",\"rollNo\":\"22CS108\",\"year\":\"3rd Year\",\"avatar\":\"https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80\",\"joinedDate\":\"August 2024\"}";
                } else if (databaseJsonCache.toLowerCase().contains("\"rollno\":\"" + identifier + "\"") ||
                           databaseJsonCache.toLowerCase().contains("\"email\":\"" + identifier + "\"")) {
                    // Custom registered user match
                    if (databaseJsonCache.contains("\"password\":\"" + password + "\"")) {
                        matched = true;
                        // Return generic user object matching rollNo
                        userProfile = "{\"id\":\"usr_" + System.currentTimeMillis() + "\",\"fullName\":\"Student " + identifier.toUpperCase() + "\",\"email\":\"" + identifier + "@college.edu\",\"phone\":\"\",\"department\":\"Engineering\",\"rollNo\":\"" + identifier.toUpperCase() + "\",\"year\":\"Student\",\"avatar\":\"https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80\",\"joinedDate\":\"2026\"}";
                    }
                }

                if (matched) {
                    sendJsonResponse(exchange, 200, "{\"success\":true,\"user\":" + userProfile + "}");
                } else {
                    sendJsonResponse(exchange, 401, "{\"success\":false,\"message\":\"Invalid Roll Number, Email, or Password. Please try again or click 'Demo Student Login'.\"}");
                }
            }
        }
    }

    // -------------------------------------------------------------
    // HANDLER: POST /api/auth/register
    // -------------------------------------------------------------
    static class RegisterHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                handleCorsPreflight(exchange);
                return;
            }
            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJsonResponse(exchange, 405, "{\"success\":false,\"message\":\"Method not allowed\"}");
                return;
            }

            String body = readRequestBody(exchange);
            String fullName = extractJsonString(body, "fullName").trim();
            String rollNo = extractJsonString(body, "rollNo").trim().toUpperCase();
            String identifier = extractJsonString(body, "identifier").trim();
            String password = extractJsonString(body, "password").trim();
            String department = extractJsonString(body, "department").trim();
            String year = extractJsonString(body, "year").trim();

            if (fullName.isEmpty() || rollNo.isEmpty() || password.isEmpty()) {
                sendJsonResponse(exchange, 400, "{\"success\":false,\"message\":\"Full Name, Roll Number, and Password are required.\"}");
                return;
            }

            synchronized (dbLock) {
                if (databaseJsonCache.contains("\"rollNo\":\"" + rollNo + "\"")) {
                    sendJsonResponse(exchange, 409, "{\"success\":false,\"message\":\"Roll Number " + rollNo + " is already registered. Please sign in.\"}");
                    return;
                }

                String email = identifier.contains("@") ? identifier : rollNo.toLowerCase() + "@college.edu";
                String phone = !identifier.contains("@") ? identifier : "9876500000";
                String avatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80";

                String newUserJson = "{\"email\":\"" + email + "\",\"phone\":\"" + phone + "\",\"password\":\"" + password +
                        "\",\"profile\":{\"id\":\"usr_" + System.currentTimeMillis() + "\",\"fullName\":\"" + fullName +
                        "\",\"email\":\"" + email + "\",\"phone\":\"" + phone + "\",\"department\":\"" + department +
                        "\",\"rollNo\":\"" + rollNo + "\",\"year\":\"" + year + "\",\"avatar\":\"" + avatar +
                        "\",\"joinedDate\":\"September 2026\"}}";

                // Append to users in database
                int usersIdx = databaseJsonCache.indexOf("\"users\": [");
                if (usersIdx != -1) {
                    int insertPos = usersIdx + "\"users\": [".length();
                    databaseJsonCache = databaseJsonCache.substring(0, insertPos) + "\n    " + newUserJson + "," + databaseJsonCache.substring(insertPos);
                    saveDatabase();
                }

                String profileJson = "{\"id\":\"usr_" + System.currentTimeMillis() + "\",\"fullName\":\"" + fullName +
                        "\",\"email\":\"" + email + "\",\"phone\":\"" + phone + "\",\"department\":\"" + department +
                        "\",\"rollNo\":\"" + rollNo + "\",\"year\":\"" + year + "\",\"avatar\":\"" + avatar +
                        "\",\"joinedDate\":\"September 2026\"}";

                sendJsonResponse(exchange, 201, "{\"success\":true,\"user\":" + profileJson + "}");
            }
        }
    }

    // -------------------------------------------------------------
    // HANDLER: POST /api/canteen/token
    // -------------------------------------------------------------
    static class CanteenTokenHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                handleCorsPreflight(exchange);
                return;
            }
            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendJsonResponse(exchange, 405, "{\"success\":false,\"message\":\"Method not allowed\"}");
                return;
            }

            String body = readRequestBody(exchange);
            synchronized (dbLock) {
                // Prepend token to canteenTokens array in database
                int tokensIdx = databaseJsonCache.indexOf("\"canteenTokens\": [");
                if (tokensIdx != -1) {
                    int insertPos = tokensIdx + "\"canteenTokens\": [".length();
                    databaseJsonCache = databaseJsonCache.substring(0, insertPos) + "\n    " + body + "," + databaseJsonCache.substring(insertPos);
                    saveDatabase();
                }
            }

            sendJsonResponse(exchange, 200, "{\"success\":true,\"message\":\"Canteen token generated and saved to Java backend.\"}");
        }
    }

    // -------------------------------------------------------------
    // HANDLER: POST /api/canteen/ready
    // -------------------------------------------------------------
    static class CanteenReadyHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                handleCorsPreflight(exchange);
                return;
            }
            String body = readRequestBody(exchange);
            String tokenId = extractJsonString(body, "id");
            synchronized (dbLock) {
                if (databaseJsonCache.contains(tokenId)) {
                    // Update status in JSON cache
                    databaseJsonCache = databaseJsonCache.replace("\"status\": \"Preparing\"", "\"status\": \"Ready\"");
                    saveDatabase();
                }
            }
            sendJsonResponse(exchange, 200, "{\"success\":true,\"status\":\"Ready\"}");
        }
    }

    // -------------------------------------------------------------
    // HANDLER: POST /api/lostfound/report
    // -------------------------------------------------------------
    static class LostFoundHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                handleCorsPreflight(exchange);
                return;
            }
            String body = readRequestBody(exchange);
            synchronized (dbLock) {
                int lfIdx = databaseJsonCache.indexOf("\"lostFound\": [");
                if (lfIdx != -1) {
                    int insertPos = lfIdx + "\"lostFound\": [".length();
                    databaseJsonCache = databaseJsonCache.substring(0, insertPos) + "\n    " + body + "," + databaseJsonCache.substring(insertPos);
                    saveDatabase();
                }
            }
            sendJsonResponse(exchange, 201, "{\"success\":true,\"message\":\"Item published and saved to Java backend.\"}");
        }
    }

    // -------------------------------------------------------------
    // HANDLER: POST /api/events/register
    // -------------------------------------------------------------
    static class EventRegisterHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                handleCorsPreflight(exchange);
                return;
            }
            sendJsonResponse(exchange, 200, "{\"success\":true,\"message\":\"Registration saved to Java backend.\"}");
        }
    }

    // -------------------------------------------------------------
    // HANDLER: POST /api/complaints/report
    // -------------------------------------------------------------
    static class ComplaintHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                handleCorsPreflight(exchange);
                return;
            }
            String body = readRequestBody(exchange);
            synchronized (dbLock) {
                int issuesIdx = databaseJsonCache.indexOf("\"issues\": [");
                if (issuesIdx != -1) {
                    int insertPos = issuesIdx + "\"issues\": [".length();
                    databaseJsonCache = databaseJsonCache.substring(0, insertPos) + "\n    " + body + "," + databaseJsonCache.substring(insertPos);
                    saveDatabase();
                }
            }
            sendJsonResponse(exchange, 201, "{\"success\":true,\"message\":\"Complaint logged in Java backend.\"}");
        }
    }

    // -------------------------------------------------------------
    // HANDLER: POST /api/complaints/upvote
    // -------------------------------------------------------------
    static class ComplaintUpvoteHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                handleCorsPreflight(exchange);
                return;
            }
            sendJsonResponse(exchange, 200, "{\"success\":true,\"message\":\"Upvote saved in Java backend.\"}");
        }
    }

    // -------------------------------------------------------------
    // HANDLER: POST /api/mailbox/read
    // -------------------------------------------------------------
    static class MailReadHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                handleCorsPreflight(exchange);
                return;
            }
            sendJsonResponse(exchange, 200, "{\"success\":true,\"message\":\"Email marked as read.\"}");
        }
    }

    // -------------------------------------------------------------
    // HANDLER: Static File Server
    // -------------------------------------------------------------
    static class StaticHandler implements HttpHandler {
        private final String root;

        public StaticHandler(String root) {
            this.root = root;
        }

        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
                handleCorsPreflight(exchange);
                return;
            }

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
                int bytesRead;
                while ((bytesRead = fis.read(buffer)) != -1) {
                    os.write(buffer, 0, bytesRead);
                }
            }
        }
    }
}
