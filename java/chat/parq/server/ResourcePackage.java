/* Copyright parq.chat(TM). Licensed under AGPL 3. See https://github.com/parqchat/parqchat */

package chat.parq.server;

import java.io.File;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public class ResourcePackage {

  private final List<File> files;

  public ResourcePackage(String basePath, String... fileNames) {
    files = Arrays.asList(fileNames).stream()
        // .map(fn -> new File(basePath, fn))
        .map(fn -> new File(fn))
        .collect(Collectors.toList());
  }

  public List<File> getFiles() {
    return files;
  }
}
