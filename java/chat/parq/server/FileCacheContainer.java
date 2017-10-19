/* Copyright parq.chat(TM). Licensed under AGPL 3. See https://github.com/parqchat/parqchat */

package chat.parq.server;

import java.io.BufferedInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.nio.ByteBuffer;
import java.nio.channels.WritableByteChannel;
import java.nio.file.Files;
import java.util.Arrays;
import java.util.Map;
import java.util.zip.GZIPOutputStream;

import org.simpleframework.http.Request;
import org.simpleframework.http.Response;
import org.simpleframework.http.core.Container;

import chat.parq.util.Streams;

public class FileCacheContainer implements Container {

  private final String basePath;
  private final Map<File, byte[]> fileCache;
  private final Map<File, byte[]> gZipFileCache;

  private final String homeFile;
  private final String defaultFile;
  private final boolean enableCache;

  public FileCacheContainer(String basePath, ResourcePackage resources, String homeFile, String defaultFile,
      boolean enableCache) {
    this.basePath = basePath;
    this.enableCache = enableCache;
    this.homeFile = homeFile;
    this.defaultFile = defaultFile;

    fileCache = resources.getFiles().stream().filter(f -> !f.getName().contains("map"))
        .collect(Streams.identityToValue(this::load));
    gZipFileCache = fileCache.keySet().stream().collect(Streams.identityToValue(k -> gzip(fileCache.get(k))));
  }

  private byte[] gzip(byte[] data) {
    try (ByteArrayOutputStream byteStream = new ByteArrayOutputStream(data.length);
        GZIPOutputStream zipOut = new GZIPOutputStream(byteStream);) {
      zipOut.write(data);
      zipOut.close();

      byte[] byteArray = byteStream.toByteArray();
      return byteArray;
    } catch (IOException e) {
      throw new RuntimeException("Error compressing data", e);
    }
  }

  @Override
  public void handle(Request req, Response resp) {
    System.out.println("Request: " + req.getPath());
    //System.out.println(req);
    
    File file = findFile(req);
    System.out.println("Serving: " + file);

    String encoding = req.getValue("Accept-Encoding");
    boolean gzip = (encoding != null) ? encoding.toLowerCase().contains("gzip") : false;
    
    byte[] responseBytes;
    if (!enableCache) {
      responseBytes = load(file);
    } else if (gzip) {
      responseBytes = gZipFileCache.get(file);
      resp.addValue("Content-Encoding", "gzip");
    } else {
      responseBytes = fileCache.get(file);
    }

    resp.setCode(200);
    // TODO: restrict
    //resp.addValue("Access-Control-Allow-Origin", "*");

    if (file.getName().contains(".css")) {
      resp.setContentType("text/css");
    } else if (file.getName().contains(".js")) {
      resp.setContentType("application/javascript");
    } else {
      resp.setContentType("text/html");
    }

    try {
      resp.setContentLength(responseBytes.length);
      WritableByteChannel out = resp.getByteChannel();
      out.write(ByteBuffer.wrap(responseBytes));
      out.close();
    } catch (IOException e) {
      e.printStackTrace();
      // TODO: handle error
    }
  }

  private File findFile(Request req) {
    String requestPath = req.getPath().toString();
    if (requestPath == null || requestPath.isEmpty() || requestPath.equals("/")) {
      return new File(basePath, homeFile);
    }

    String filePath = new File(basePath, requestPath).getPath();

    try {
      return fileCache.keySet().stream().filter(f -> filePath.contains(f.getName()))
          .max((a, b) -> a.getPath().compareTo(b.getPath())).get();
    } catch (Exception e) {
      System.out.println("File not found: " + filePath);
      return new File(basePath, defaultFile);
    }
  }

  private byte[] load(File file) {
    try {
      if (!file.exists()) {
        InputStream in = getClass().getResourceAsStream(file.getPath().replace(basePath, ""));
        if (in == null) {
          throw new FileNotFoundException(file.getAbsolutePath());
        }

        return readStream(in);
      } else {
        return Files.readAllBytes(file.toPath());
      }
    } catch (IOException e) {
      System.err.println("Failed to read file " + file + " :\n" + e);
      return null;
    } finally {
      System.out.println("Loaded : " + file);
    }
  }

  private byte[] readStream(InputStream in) throws IOException {
    byte[] buffer = new byte[5000000];
    BufferedInputStream bfs = new BufferedInputStream(in);
    int len = 0;
    int read;

    while (bfs.available() > 0 && (read = bfs.read(buffer, len, bfs.available())) != -1) {
      len += read;
    }

    in.close();
    return Arrays.copyOf(buffer, len);
  }
}
