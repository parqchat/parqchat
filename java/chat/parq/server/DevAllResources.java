/* Copyright parq.chat(TM). Licensed under AGPL 3. See https://github.com/parqchat/parqchat */

package chat.parq.server;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;

public class DevAllResources extends ResourcePackage {

  public DevAllResources(String basePath) {
    super(basePath, findAllFiles(basePath));
  }

  private static String[] findAllFiles(String basePath) {
    try {
      return Files.walk(Paths.get(basePath))
          .filter(p -> p.toFile().isFile())
          .map(p -> p.toString())
          .toArray(String[]::new);
    } catch (IOException e) {
      throw new RuntimeException(e);
    }
  }
}
