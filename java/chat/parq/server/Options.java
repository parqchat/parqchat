/* Copyright parq.chat(TM). Licensed under AGPL 3. See https://github.com/parqchat/parqchat */

package chat.parq.server;

import java.util.Arrays;
import java.util.Map;
import java.util.stream.Collectors;

public class Options {

  public final String chatHost;

  public final int httpPort;

  public final int chatPort;
  
  public final boolean devMode;
  
  public final boolean enableCache;
  public final String basePath;
  public final String homeFile;
  public final String defaultFile;

  public final boolean useTls;
  public final String keystoreFile;
  public final String keystorePass;
  public final String keyPassword;
  
  private final Map<String, String> args;

  public Options(String[] args) {
    if (args == null) {
      args = new String[0];
    }

    this.args = Arrays.asList(args).stream().map(arg -> arg.split("="))
        .collect(Collectors.toMap(split -> split[0], split -> split[1]));

    chatHost = getString("chatHost", "localhost");
    httpPort = getInt("httpPort", 80);
    chatPort = getInt("chatPort", 443);

    devMode = getBoolean("devMode", false);
    
    enableCache = getBoolean("enableCache", true);
    basePath = getString("basePath", "");
    homeFile = getString("homeFile", "index.html");
    defaultFile = getString("defaultFile", "chat.html");
    
    useTls = getBoolean("useTls", true);
    keystoreFile = getString("keystoreFile", "");
    keystorePass = getString("keystorePass", "");
    keyPassword = getString("keyPassword", "");
  }

  private boolean getBoolean(String arg, boolean defaultValue) {
    return Boolean.parseBoolean(args.getOrDefault(arg, Boolean.toString(defaultValue)));
  }

  private int getInt(String arg, int defaultValue) {
    return Integer.parseInt(args.getOrDefault(arg, "" + defaultValue));
  }

  private String getString(String arg, String defaultValue) {
    return args.getOrDefault(arg, defaultValue);
  }
}
