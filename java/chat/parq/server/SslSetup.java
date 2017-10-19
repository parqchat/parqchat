/* Copyright parq.chat(TM). Licensed under AGPL 3. See https://github.com/parqchat/parqchat */

package chat.parq.server;

import java.io.FileInputStream;
import java.security.KeyStore;
import java.util.Arrays;

import javax.net.ssl.KeyManagerFactory;
import javax.net.ssl.SSLContext;
import javax.net.ssl.SSLParameters;
import javax.net.ssl.TrustManagerFactory;

class SslSetup {

	static SSLContext getSslContext(Options o) throws Exception {
    //System.setProperty("javax.net.debug", "all");
    System.setProperty("jdk.tls.ephemeralDHKeySize", "2048");

		KeyStore ks = KeyStore.getInstance("JKS");
		ks.load(new FileInputStream(o.keystoreFile), o.keystorePass.toCharArray());

		KeyManagerFactory kmf = KeyManagerFactory.getInstance("SunX509");
		kmf.init(ks, o.keyPassword.toCharArray());

		TrustManagerFactory tmf = TrustManagerFactory.getInstance("SunX509");
		tmf.init(ks);

		SSLContext sslContext = SSLContext.getInstance("TLSv1.2");
		sslContext.init(kmf.getKeyManagers(), tmf.getTrustManagers(), null);

		SSLParameters supportedParams = sslContext.getSupportedSSLParameters();
		System.out.println("UseCipherSuitesOrder = " + supportedParams.getUseCipherSuitesOrder());
		Arrays.stream(supportedParams.getCipherSuites()).forEach(System.out::println);
		Arrays.stream(supportedParams.getProtocols()).forEach(System.out::println);
		System.out.println("Provider = " + sslContext.getProvider());

		return sslContext;
	}

}
