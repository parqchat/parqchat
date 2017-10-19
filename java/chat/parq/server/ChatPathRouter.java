/* Copyright parq.chat(TM). Licensed under AGPL 3. See https://github.com/parqchat/parqchat */

package chat.parq.server;

import static org.simpleframework.http.Protocol.SEC_WEBSOCKET_PROTOCOL;
import static org.simpleframework.http.Protocol.SEC_WEBSOCKET_VERSION;
import static org.simpleframework.http.Protocol.UPGRADE;
import static org.simpleframework.http.Protocol.WEBSOCKET;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.simpleframework.http.Path;
import org.simpleframework.http.Request;
import org.simpleframework.http.Response;
import org.simpleframework.http.socket.service.Router;
import org.simpleframework.http.socket.service.Service;

/**
 * Routes chats based on the incoming request path. A new {@link ChatService} is
 * created if one does not already exist for the specified path.
 */
public class ChatPathRouter implements Router {

  // TODO: Use a concurrent map
  private final Map<String, Service> registry = new HashMap<>();

  @Override
  public Service route(Request request, Response response) {
    String token = request.getValue(UPGRADE);

    if (token != null) {
      if (token.equalsIgnoreCase(WEBSOCKET)) {
        List<String> protocols = request.getValues(SEC_WEBSOCKET_PROTOCOL);
        String version = request.getValue(SEC_WEBSOCKET_VERSION);
        Path path = request.getPath();
        String normal = path.getPath();

        if (version != null) {
          response.setValue(SEC_WEBSOCKET_VERSION, version);
        }
        for (String protocol : protocols) {
          String original = response.getValue(SEC_WEBSOCKET_PROTOCOL);

          if (original == null) {
            response.setValue(SEC_WEBSOCKET_PROTOCOL, protocol);
          }
        }

        if (registry.containsKey(normal)) {
          return registry.get(normal);
        } else {
          Service service = new ChatService(normal);
          registry.put(normal, service);
          return service;
        }
      }
    }

    return null;
  }
}
