/* Copyright parq.chat(TM). Licensed under AGPL 3. See https://github.com/parqchat/parqchat */

package chat.parq.server;

import org.mockito.ArgumentMatcher;
import org.simpleframework.http.socket.Frame;

class FrameMatcher implements ArgumentMatcher<Frame> {

  private String expectedText;

  FrameMatcher(String expected) {
    expectedText = expected;
  }

  @Override
  public boolean matches(Frame argument) {
    if (expectedText.equals(argument.getText())) {
      return true;
    }
    
    System.err.println(
        "Expected : " + expectedText + "\n" +
        "Actual   : " + argument.getText());
    return false;
  }
}