/* Copyright parq.chat(TM). Licensed under AGPL 3. See https://github.com/parqchat/parqchat */

package chat.parq.server;

import java.io.IOException;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentSkipListSet;

import org.simpleframework.http.socket.CloseCode;
import org.simpleframework.http.socket.Frame;
import org.simpleframework.http.socket.FrameChannel;
import org.simpleframework.http.socket.FrameListener;
import org.simpleframework.http.socket.Reason;
import org.simpleframework.http.socket.Session;

import chat.parq.server.Metrics.StartedTimer;

public class ChatListener implements FrameListener {

  class ComparableChannel implements Comparable<ComparableChannel> {
    final FrameChannel channel;

    ComparableChannel(FrameChannel channel) {
      this.channel = channel;
    }

    @Override
    public int compareTo(ComparableChannel o) {
      return channel.hashCode() - o.hashCode();
    }

    @Override
    public int hashCode() {
      return channel.hashCode();
    }

    @Override
    public boolean equals(Object obj) {
      return channel.equals(obj);
    }
  }

  final Metrics metrics;

  // TODO: This will need some more work...
  private final Set<ComparableChannel> channels = new ConcurrentSkipListSet<>();
  // private final Set<FrameChannel> channels = Collections.synchronizedSet(new
  // HashSet<>());
  // new ConcurrentSkipListSet<FrameChannel>();
  // new HashSet<>();

  final Map<FrameChannel, ComparableChannel> channelMap = new HashMap<>();
  
  private final Map<FrameChannel, Integer> errorCount = new HashMap<>();
  
  private final PasswordHandler pwHandler;

  private final String chatName;

  public ChatListener(String chatName, Metrics metrics) {
    this.chatName = chatName;
    this.metrics = metrics;
    pwHandler = new PasswordHandler(this);
  }

  @Override
  public void onFrame(Session session, Frame frame) {
    metrics.incFramesIn();

    if (frame.getType().isClose()) {
      return;
    }

    String text = frame.getText();

    if (text != null) {
      metrics.incBytesIn(text.length());
    }

    FrameChannel channel = session.getChannel();

    if (pwHandler.handle(session, channel, text)) {
      return;
    }

    if (text == null || text.isEmpty()) {
      return;
    }

    metrics.incFramesInTxt();
    StartedTimer timer = metrics.getFramesRelayTimer();

    channels.stream().filter(e -> !e.channel.equals(channel)).parallel().forEach(e -> send(e.channel, frame));

    timer.stop();

  }

  void addChannel(Session session) {
    FrameChannel channel = session.getChannel();

    if (!channelMap.containsKey(channel)) {
      ComparableChannel comparable = new ComparableChannel(channel);
      channels.add(comparable);
      channelMap.put(channel, comparable);
      log("Added channel");
    }
  }

  void send(FrameChannel channel, Frame frame) {
    try {
      channel.send(frame);

      metrics.incBytesOut(frame.getText().length());
      metrics.incFramesOut();
    } catch (IOException e) {
      metrics.incFramesOutErr();

      countError(channel);
    }
  }
  
  private void countError(FrameChannel channel) {
    errorCount.merge(channel, 1, (old, unused) -> {return old + 1;});
    if (errorCount.get(channel) >= 3) {
      eject(channel, CloseCode.INTERNAL_SERVER_ERROR, "Too many error on channel.");
    }
  }

  @Override
  public void onError(Session session, Exception cause) {
    cause.printStackTrace();
    countError(session.getChannel());
  }

  @Override
  public void onClose(Session session, Reason reason) {
    log("onClose: " + reason);

    FrameChannel channel = session.getChannel();
    ComparableChannel comparable = channelMap.remove(channel);
    if (comparable != null) {
      channels.remove(comparable);
    }
  }
  
  private void eject(FrameChannel channel, CloseCode code, String s) {
    try {
      channel.close(new Reason(code, s));
    } catch (IOException e) {
      e.printStackTrace();
    }
  }
  
  public void log(String s) {
    Instant now = Instant.now();
    System.out.printf("[%s]: %s\n", now, s);
  }

  boolean hasChannel(FrameChannel channel) {
    return channelMap.containsKey(channel);
  }
}
