/* Copyright parq.chat(TM). Licensed under AGPL 3. See https://github.com/parqchat/parqchat */

package chat.parq.server;

import java.io.IOException;
import java.net.InetSocketAddress;

import javax.net.ssl.SSLContext;

import org.simpleframework.http.core.Container;
import org.simpleframework.http.core.ContainerSocketProcessor;
import org.simpleframework.http.socket.service.Router;
import org.simpleframework.http.socket.service.RouterContainer;
import org.simpleframework.transport.connect.SocketConnection;

public class Server {

  private SocketConnection connection;

  private InetSocketAddress address;

  private static final int THREADS = 20;

  private SSLContext sslContext;

  public Server(Options o) throws Exception {
    
    // HTTP redirect server
    
    RedirectContainer container = new RedirectContainer();
    ContainerSocketProcessor redirectServer = new ContainerSocketProcessor(container, 10);
    connection = new SocketConnection(redirectServer);

    connection.connect(new InetSocketAddress(o.httpPort));
    
    ResourcePackage resources = o.devMode ? new DevAllResources(o.basePath) : new LiveLimitedResources();
    
    // TLS server - HTTPS and WSS
    Router router = new ChatPathRouter();
    Container httpResourceContainer = new FileCacheContainer(o.basePath, resources,
        o.homeFile, o.defaultFile, o.enableCache);
    RouterContainer routerContainer = new RouterContainer(httpResourceContainer, router, THREADS);

    ContainerSocketProcessor server = new ContainerSocketProcessor(routerContainer, THREADS);
    //TraceAnalyzer analyzer = new DebugAnalyzer();

    if (o.useTls) {
      sslContext = SslSetup.getSslContext(o);
    }

    connection = new SocketConnection(server /*, analyzer*/);
    address = new InetSocketAddress(o.chatPort);
  }

  public static void main(String[] args) throws Exception {
    Options o = new Options(args);
    Server server = new Server(o);
    server.start(o);
  }

  public void start(Options o) throws IOException {
    if (o.useTls) {
      connection.connect(address, sslContext);
    } else {
      connection.connect(address);
    }

    Metrics.getInstance().startReporter(60);

    if (o.devMode) {
      System.out.println("\n ** Server running on http://localhost:" + o.chatPort + "\n");
    }
  }

  public void stop() throws IOException {
    connection.close();
  }
}
