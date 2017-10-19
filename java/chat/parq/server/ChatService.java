/* Copyright parq.chat(TM). Licensed under AGPL 3. See https://github.com/parqchat/parqchat */

package chat.parq.server;

import java.io.IOException;
import java.time.Instant;

import org.simpleframework.http.socket.FrameChannel;
import org.simpleframework.http.socket.FrameListener;
import org.simpleframework.http.socket.Session;
import org.simpleframework.http.socket.service.Service;

public class ChatService implements Service {

  private final FrameListener listener;
  private final String chatName;

  public ChatService(String chatName) {
    this.chatName = chatName;
    listener = new ChatListener(chatName, Metrics.getInstance());
  }

  @Override
  public void connect(Session session) {
    log(String.format("Session (%s): [%s] %s", chatName, session.getRequest().getClientAddress(), session));

    FrameChannel channel = session.getChannel();
    try {
      channel.register(listener);
    } catch (IOException e) {
      e.printStackTrace();
    }
  }
  
  public void log(String s) {
    Instant now = Instant.now();
    System.out.printf("[%s]: %s\n", now, s);
  }
}
