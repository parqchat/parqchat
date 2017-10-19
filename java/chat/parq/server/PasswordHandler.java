/* Copyright parq.chat(TM). Licensed under AGPL 3. See https://github.com/parqchat/parqchat */

package chat.parq.server;

import static chat.parq.server.JsonHelper.fromJson;
import static chat.parq.server.JsonHelper.toJsonMap;

import java.util.Map;

import org.simpleframework.http.socket.DataFrame;
import org.simpleframework.http.socket.FrameChannel;
import org.simpleframework.http.socket.FrameType;
import org.simpleframework.http.socket.Session;

class PasswordHandler {

  static final String TYPE = "type";
  static final String PASSWORD = "password";
  static final String PWHASHED = "pwhashed";
  static final String PWSTATUS = "pwstatus";
  static final String PASSWORD_SET = "password_set";
  static final String PASSWORD_OK = "password_ok";
  static final String PASSWORD_WRONG = "password_wrong";

  private final ChatListener listener;
  
  private String password;
  
  PasswordHandler(ChatListener listener) {
    this.listener = listener;
  }
  
  /**
   * Handles the password message. Returns true if the calling ChatListener
   * should return without further processing of the message. Otherwise returns
   * false.
   */
  boolean handle(Session session, FrameChannel channel, String text) {
    String sentPw = extractPassword(text);

    if (sentPw != null) {
      if (password == null) {
        // Upgrades to password protected
        password = sentPw;
        listener.addChannel(session);
        listener.log("Password set");
        listener.send(channel, newFrame(PASSWORD_SET));
      } else if (password.equals(sentPw)) {
        // Valid password
        listener.addChannel(session);
        listener.log("Valid password");
        listener.send(channel, newFrame(PASSWORD_OK));
      } else {
        listener.send(channel, newFrame(PASSWORD_WRONG));
      }
      
      // The password Frame is never relayed
      return true;
    } else if (password == null) {
      // Don't use a password
      listener.addChannel(session);
    } else if (!listener.hasChannel(channel)) {
      // A password is set, but this session is not registered with a correct
      // password yet.
      listener.send(channel, newFrame(PASSWORD_WRONG));
      return true;
    }

    return false;
  }

  private String extractPassword(String text) {
    // This achieves a 15-20% speedup on non-password messages by avoiding the JSON conversion.
    if (text == null || !text.contains(TYPE) || !text.contains(PASSWORD) || !text.contains(PWHASHED)) {
      return null;
    }

    Map<String, String> map = fromJson(text);

    if (map != null && PASSWORD.equals(map.get(TYPE)) && map.containsKey(PWHASHED)) {
      return map.get(PWHASHED);
    }

    return null;
  }

  private DataFrame newFrame(String status) {
    return new DataFrame(FrameType.TEXT, toJsonMap(TYPE, PASSWORD, PWSTATUS, status));
  }
}
