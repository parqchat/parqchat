/* Copyright parq.chat(TM). Licensed under AGPL 3. See https://github.com/parqchat/parqchat */

package chat.parq.server;

import static chat.parq.server.Sleep.sleepSec;

import com.codahale.metrics.ConsoleReporter;
import com.codahale.metrics.Counter;
import com.codahale.metrics.Meter;
import com.codahale.metrics.MetricRegistry;
import com.codahale.metrics.Timer.Context;

public class Metrics {

  public class StartedTimer {
    private final Context timer;

    private StartedTimer(String name) {
      this.timer = getStartedTimerContext(name);
    }

    public void stop() {
      timer.stop();
    }
  }

  public static final String BYTES_IN = "BYTES_IN";
  public static final String BYTES_OUT = "BYTES_OUT";
  public static final String BYTES_IN_TPUT = "BYTES_IN_TPUT";
  public static final String BYTES_OUT_TPUT = "BYTES_OUT_TPUT";

  public static final String FRAMES_IN = "FRAMES_IN";
  public static final String FRAMES_IN_TXT = "FRAMES_IN_TXT";
  public static final String FRAMES_OUT = "FRAMES_OUT";
  public static final String FRAMES_OUT_ERR = "FRAMES_OUT_ERR";
  public static final String FRAMES_RELAY_TIME = "FRAMES_RELAY_TIME";
  public static final String FRAMES_IN_TPUT = "FRAMES_IN_TPUT";
  public static final String FRAMES_OUT_TPUT = "FRAMES_OUT_TPUT";

  private final MetricRegistry registry;

  private final Counter bytesIn;
  private final Counter bytesOut;
  private final Meter bytesInTput;
  private final Meter bytesOutTput;
  
  private final Counter framesIn;
  private final Counter framesInTxt;
  private final Counter framesOut;
  private final Counter framesOutErr;
  private final Meter framesInTput;
  private final Meter framesOutTput;

  private static Metrics instance;

  public Metrics(MetricRegistry registry) {
    this.registry = registry;

    bytesIn = getCounter(BYTES_IN);
    bytesOut = getCounter(BYTES_OUT);
    bytesInTput = getMeter(BYTES_IN_TPUT);
    bytesOutTput = getMeter(BYTES_OUT_TPUT);

    
    framesIn = getCounter(FRAMES_IN);
    framesInTxt = getCounter(FRAMES_IN_TXT);
    framesOut = getCounter(FRAMES_OUT);
    framesOutErr = getCounter(FRAMES_OUT_ERR);
    framesInTput = getMeter(FRAMES_IN_TPUT);
    framesOutTput = getMeter(FRAMES_OUT_TPUT);
    
    /*
    OperatingSystemMXBean bean = ManagementFactory.getOperatingSystemMXBean();
    bean.getSystemLoadAverage();
    ManagementFactory.getMemoryMXBean().getHeapMemoryUsage();
    */
  }

  public static Metrics getInstance() {
    if (instance == null) {
      instance = new Metrics(new MetricRegistry());
    }

    return instance;
  }
  
  public void incBytesIn(int bytes) {
    bytesIn.inc(bytes);
    bytesInTput.mark(bytes);
  }

  public void incBytesOut(int bytes) {
    bytesOut.inc(bytes);
    bytesOutTput.mark(bytes);
  }

  public void incFramesIn() {
    framesIn.inc();
    framesInTput.mark();
  }

  public void incFramesInTxt() {
    framesInTxt.inc();
  }

  public void incFramesOut() {
    framesOut.inc();
    framesOutTput.mark();
  }

  public void incFramesOutErr() {
    framesOutErr.inc();
  }

  public StartedTimer getFramesRelayTimer() {
    return new StartedTimer(FRAMES_RELAY_TIME);
  }

  public ConsoleReporter getConsoleReporter() {
    return ConsoleReporter.forRegistry(registry).build();
  }

  public void startReporter(final int intervalSec) {
    new Thread(() -> {
      while (true) {
        sleepSec(intervalSec);
        getConsoleReporter().report();
      }
    }).start();
  }

  private Counter getCounter(String name) {
    return registry.counter(name);
  }
  
  private Meter getMeter(String name) {
    return registry.meter(name);
  }

  private Context getStartedTimerContext(String name) {
    return registry.timer(name).time();
  }
}
