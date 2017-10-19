/* Copyright parq.chat(TM). Licensed under AGPL 3. See https://github.com/parqchat/parqchat */

package chat.parq.server;

public class Sleep {

  public static void sleepSec(long sec) {
    sleepMs(sec * 1000);
  }

  public static void sleepMs(long ms) {
    try {
      Thread.sleep(ms);
    } catch (InterruptedException e) {
      // ignore
      e.printStackTrace();
    }
  }
}
