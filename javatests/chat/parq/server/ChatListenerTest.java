/* Copyright parq.chat(TM). Licensed under AGPL 3. See https://github.com/parqchat/parqchat */

package chat.parq.server;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.io.IOException;

import org.junit.Before;
import org.junit.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.simpleframework.http.socket.Frame;
import org.simpleframework.http.socket.FrameChannel;
import org.simpleframework.http.socket.FrameType;
import org.simpleframework.http.socket.Session;

import com.codahale.metrics.MetricRegistry;

public class ChatListenerTest {

  @Mock
  private Session mockSession1;

  @Mock
  private Session mockSession2;

  @Mock
  private FrameChannel mockFrameChannel1;

  @Mock
  private FrameChannel mockFrameChannel2;

  @Mock
  private Frame mockFrame1;

  @Mock
  private Frame mockFrame2;

  @Mock
  private Frame mockFrame3;

  private ChatListener listener;

  @Before
  public void setup() {
    MockitoAnnotations.initMocks(this);

    listener = new ChatListener("test", new Metrics(new MetricRegistry()));

    when(mockSession1.getChannel()).thenReturn(mockFrameChannel1);
    when(mockSession2.getChannel()).thenReturn(mockFrameChannel2);

    when(mockFrame1.getType()).thenReturn(FrameType.TEXT);
    when(mockFrame2.getType()).thenReturn(FrameType.TEXT);
    when(mockFrame3.getType()).thenReturn(FrameType.TEXT);
  }

  @Test
  public void testOnFrame() throws IOException {
    when(mockFrame1.getText()).thenReturn("test1");
    listener.onFrame(mockSession1, mockFrame1);

    when(mockFrame2.getText()).thenReturn("test2");
    listener.onFrame(mockSession2, mockFrame2);
    listener.onFrame(mockSession2, mockFrame2);

    verify(mockFrameChannel1, times(2)).send(mockFrame2);
  }

  @Test
  public void testClosedChannel() throws IOException {
    listener.onFrame(mockSession1, mockFrame1);
    doThrow(new IOException("closed")).when(mockFrameChannel1).send(any(Frame.class));

    when(mockFrame2.getText()).thenReturn("test2");
    listener.onFrame(mockSession2, mockFrame2);

    // TODO: Need to refine this
  }

  @Test
  public void testOnClose() {
    listener.onFrame(mockSession1, mockFrame1);

    listener.onClose(mockSession1, null);
  }

  @Test
  public void testOnCloseTwice() {
    listener.onFrame(mockSession1, mockFrame1);

    listener.onClose(mockSession1, null);
    listener.onClose(mockSession1, null);
  }

  @Test
  public void testMetrics() {
    listener.onFrame(mockSession1, mockFrame1);

    when(mockFrame2.getText()).thenReturn("test2");
    listener.onFrame(mockSession2, mockFrame2);
    listener.onFrame(mockSession2, mockFrame2);

    listener.metrics.getConsoleReporter().report();
  }

  @Test
  public void testNewPassword() throws IOException {
    String password = "ABCDEF";
    when(mockFrame1.getText()).thenReturn(
        "{\"pwhashed\":\"" + password + "\",\"type\":\"password\"}");

    when(mockFrame2.getText()).thenReturn("test2");
    listener.onFrame(mockSession2, mockFrame2);
    listener.onFrame(mockSession1, mockFrame1);

    verify(mockFrameChannel1, times(1)).send(argThat(new FrameMatcher(
        "{\"type\":\"password\",\"pwstatus\":\"password_set\"}")));
    verify(mockFrameChannel2, never()).send((Frame) any());
  }

  @Test
  public void testValidPassword() throws IOException {
    String password = "ABCDEF";
    when(mockFrame1.getText()).thenReturn("{\"pwhashed\":\"" + password + "\"}");
    listener.onFrame(mockSession1, mockFrame1);

    when(mockFrame2.getText()).thenReturn("{\"pwhashed\":\"" + password + "\"}");
    listener.onFrame(mockSession2, mockFrame2);

    when(mockFrame3.getText()).thenReturn("OK message");
    listener.onFrame(mockSession2, mockFrame3);

    verify(mockFrameChannel1, times(1)).send(mockFrame3);
  }

  @Test
  public void testInvalidPassword() throws IOException {
    String password = "ABCDEF";
    when(mockFrame1.getText()).thenReturn(
        "{\"pwhashed\":\"" + password + "\",\"type\":\"password\"}");
    listener.onFrame(mockSession1, mockFrame1);

    when(mockFrame2.getText()).thenReturn(
        "{\"pwhashed\":\"" + "INVALID" + "\",\"type\":\"password\"}");
    listener.onFrame(mockSession2, mockFrame2);

    when(mockFrame3.getText()).thenReturn("Should not appear");
    listener.onFrame(mockSession2, mockFrame3);

    
    verify(mockFrameChannel1, times(1)).send(argThat(new FrameMatcher(
        "{\"type\":\"password\",\"pwstatus\":\"password_set\"}")));
    
    verify(mockFrameChannel2, times(2)).send(argThat(new FrameMatcher(
        "{\"type\":\"password\",\"pwstatus\":\"password_wrong\"}")));
  }
}
