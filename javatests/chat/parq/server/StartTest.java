/* Copyright parq.chat(TM). Licensed under AGPL 3. See https://github.com/parqchat/parqchat */

package chat.parq.server;

import org.junit.Test;

public class StartTest {

  @Test
  public void testStart() throws Exception {
    Server.main(new String[] { "devMode=true", "enableCache=false", "basePath=webclient/main", "defaultFile=chat.html",
        "httpPort=9980", "chatPort=9999", "useTls=false" });
  }
}
