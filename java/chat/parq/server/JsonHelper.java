/* Copyright parq.chat(TM). Licensed under AGPL 3. See https://github.com/parqchat/parqchat */

package chat.parq.server;

import java.io.IOException;
import java.io.StringReader;
import java.io.StringWriter;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.Map.Entry;

import com.google.gson.stream.JsonReader;
import com.google.gson.stream.JsonWriter;

public class JsonHelper {

  public static String toJsonMap(String... keyValues) {
    if (keyValues.length == 0 || keyValues.length % 2 != 0) {
      throw new IllegalArgumentException("Needs key/value pairs: " + Arrays.asList(keyValues));
    }

    Map<String, String> map = new HashMap<>();
    for (int i = 0; i < keyValues.length; i += 2) {
      map.put(keyValues[i], keyValues[i + 1]);
    }

    return toJsonMap(map);
  }

  public static String toJsonMap(Map<String, String> map) {
    StringWriter sWriter = new StringWriter();

    try (JsonWriter jWriter = new JsonWriter(sWriter)) {
      jWriter.beginObject();

      for (Entry<String, String> e : map.entrySet()) {
        jWriter.name(e.getKey()).value(e.getValue());
      }

      jWriter.endObject();
    } catch (IOException e1) {
      return "";
    }

    return sWriter.toString();
  }

  public static Map<String, String> fromJson(String text) {
    Map<String, String> result = new HashMap<>();

    StringReader sReader = new StringReader(text);

    try (JsonReader jReader = new JsonReader(sReader)) {
      jReader.beginObject();
      while (jReader.hasNext()) {
        result.put(jReader.nextName(), jReader.nextString());
      }
    } catch (IOException e) {
      return null;
    }

    return result;
  }
}
