/* Copyright parq.chat(TM). Licensed under AGPL 3. See https://github.com/parqchat/parqchat */

package chat.parq.server;

import static chat.parq.server.JsonHelper.toJsonMap;
import static chat.parq.server.PasswordHandler.PASSWORD;
import static chat.parq.server.PasswordHandler.PASSWORD_OK;
import static chat.parq.server.PasswordHandler.PASSWORD_SET;
import static chat.parq.server.PasswordHandler.PASSWORD_WRONG;
import static chat.parq.server.PasswordHandler.PWHASHED;
import static chat.parq.server.PasswordHandler.PWSTATUS;
import static chat.parq.server.PasswordHandler.TYPE;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.*;

import java.io.IOException;
import java.lang.reflect.Field;

import org.junit.Before;
import org.junit.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.simpleframework.http.socket.FrameChannel;
import org.simpleframework.http.socket.Session;

public class PasswordHandlerTest {

  @Mock
  private ChatListener mockListener;

  @Mock
  private Session mockSession1;

  @Mock
  private Session mockSession2;

  @Mock
  private FrameChannel mockFrameChannel1;

  @Mock
  private FrameChannel mockFrameChannel2;

  private PasswordHandler handler;

  @Before
  public void setup() {
    MockitoAnnotations.initMocks(this);

    handler = new PasswordHandler(mockListener);
  }

  @Test
  public void testNewPassword() throws IOException {
    String password = "ABCDEF";

    boolean stop = handler.handle(mockSession1, mockFrameChannel1,
        toJsonMap(PWHASHED, password, TYPE, PASSWORD));

    assertTrue(stop);
    assertEquals(password, getPassword());

    verify(mockListener, times(1)).addChannel(mockSession1);
    verify(mockListener, times(1)).send(eq(mockFrameChannel1),
        argThat(new FrameMatcher(toJsonMap(TYPE, PASSWORD, PWSTATUS, PASSWORD_SET))));
  }

  @Test
  public void testValidPassword() throws IOException {
    String password = "ABCDEF";

    handler.handle(mockSession1, mockFrameChannel1,
        toJsonMap(PWHASHED, password, TYPE, PASSWORD));

    boolean stop = handler.handle(mockSession2, mockFrameChannel2,
        toJsonMap(PWHASHED, password, TYPE, PASSWORD));

    assertTrue(stop);
    assertEquals(password, getPassword());

    verify(mockListener, times(1)).addChannel(mockSession1);
    verify(mockListener, times(1)).send(eq(mockFrameChannel1),
        argThat(new FrameMatcher(toJsonMap(TYPE, PASSWORD, PWSTATUS, PASSWORD_SET))));

    verify(mockListener, times(1)).addChannel(mockSession2);
    verify(mockListener, times(1)).send(eq(mockFrameChannel2),
        argThat(new FrameMatcher(toJsonMap(TYPE, PASSWORD, PWSTATUS, PASSWORD_OK))));
  }

  @Test
  public void testInvalidPassword() throws IOException {
    String password = "ABCDEF";

    handler.handle(mockSession1, mockFrameChannel1,
        toJsonMap(PWHASHED, password, TYPE, PASSWORD));

    boolean stop = handler.handle(mockSession2, mockFrameChannel2,
        toJsonMap(PWHASHED, "INVALID", TYPE, PASSWORD));

    assertTrue(stop);

    assertEquals(password, getPassword());

    verify(mockListener, times(1)).send(eq(mockFrameChannel1),
        argThat(new FrameMatcher(toJsonMap(TYPE, PASSWORD, PWSTATUS, PASSWORD_SET))));
    
    verify(mockListener, never()).addChannel(mockSession2);
    verify(mockListener, times(1)).send(eq(mockFrameChannel2),
        argThat(new FrameMatcher(toJsonMap(TYPE, PASSWORD, PWSTATUS, PASSWORD_WRONG))));
  }
  
  @Test
  public void testNoPassword() throws IOException {
    String password = "ABCDEF";

    handler.handle(mockSession1, mockFrameChannel1,
        toJsonMap(PWHASHED, password, TYPE, PASSWORD));

    boolean stop = handler.handle(mockSession2, mockFrameChannel2,
        "some text -- but no password");

    assertTrue(stop);

    assertEquals(password, getPassword());

    verify(mockListener, times(1)).send(eq(mockFrameChannel1),
        argThat(new FrameMatcher(toJsonMap(TYPE, PASSWORD, PWSTATUS, PASSWORD_SET))));
    
    verify(mockListener, never()).addChannel(mockSession2);
    verify(mockListener, times(1)).send(eq(mockFrameChannel2),
        argThat(new FrameMatcher(toJsonMap(TYPE, PASSWORD, PWSTATUS, PASSWORD_WRONG))));
  }

  private String getPassword() {
    try {
      Field field = PasswordHandler.class.getDeclaredField("password");
      field.setAccessible(true);
      return (String) field.get(handler);
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }
}
