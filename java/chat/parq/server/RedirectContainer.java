/* Copyright parq.chat(TM). Licensed under AGPL 3. See https://github.com/parqchat/parqchat */

package chat.parq.server;

import java.io.IOException;

import org.simpleframework.http.Request;
import org.simpleframework.http.Response;
import org.simpleframework.http.core.Container;

public class RedirectContainer implements Container {

  @Override
  public void handle(Request req, Response resp) {

    String before = req.getAddress().toString().trim();
    //System.out.println("HTTP Request: " + before);

    String after = before.replaceAll("^http:", "https://");
    if (!after.startsWith("https")) {
      String host = req.getValue("Host");
      host = host.replaceFirst(":80", ":9999");
      after = "https://" + host + after;
    }
    //System.out.println("Redirect to:  " + after);

    resp.setCode(303);
    resp.setValue("Location", after);
    
    try {
      resp.close();
    } catch (IOException e) {
      e.printStackTrace();
    }
  }
}
