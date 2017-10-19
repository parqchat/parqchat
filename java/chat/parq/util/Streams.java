/* Copyright parq.chat(TM). Licensed under AGPL 3. See https://github.com/parqchat/parqchat */

package chat.parq.util;

import java.util.Arrays;
import java.util.Collection;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collector;
import java.util.stream.Collectors;
import java.util.stream.Stream;


public class Streams {

  /**
   * Returns a specialised {@link Collector} which results in a {@link Map}
   * where the keys are the elements of the stream, and the values is provided
   * by the given mapping function.
   * 
   * @param <T> the type of the input elements, and keys of the Map
   * @param <U> the output type of the value mapping function
   * 
   * @param valueMapper a mapping function to produce values
   * @return a {@code Collector} which collects elements into a {@code Map}
   *         whose keys are as given by the stream, and values are the result of
   *         applying the given mapping function to the input elements.
   */
  public static <T, U> Collector<T, ?, Map<T, U>> identityToValue(
      Function<? super T, ? extends U> valueMapper) {
    return Collectors.toMap(Function.identity(), valueMapper);
  }
  
  /**
   * Returns a {@link Map} based on the given {@link Collection}. The keys are
   * the elements of the Collection, and the values is provided by the given
   * mapping function.
   * 
   * @param <T> the type of the input elements, and keys of the Map
   * @param <U> the output type of the value mapping function
   * 
   * @param c Collection of elements to map
   * @param valueMapper a mapping function to produce values
   * @return a {@code Map} whose keys are as given by the Collection, and values
   *         are the result of applying the given mapping function to the input
   *         elements.
   */
  public static <T, U> Map<T, U> identityToValue(
      Collection<T> c, Function<? super T, ? extends U> valueMapper) {
      return c.stream().collect(identityToValue(valueMapper));
  }

  /**
   * Returns a specialised {@link Collector} which results in a {@link Map}
   * where the keys are provided by the given mapping function, and the values
   * are the elements of the stream. 
   * 
   * @param <T> the type of the input elements, and values of the Map
   * @param <K> the output type of the key mapping function
   * 
   * @param keyMapper a mapping function to produce keys
   * @return a {@code Collector} which collects elements into a {@code Map}
   *         whose keys are the result of applying the given mapping function
   *         to the input elements, and values are as given by the stream.
   */
  public static <T, K> Collector<T, ?, Map<K, T>> keytoIdentity(
      Function<? super T, ? extends K> keyMapper) {
    return Collectors.toMap(keyMapper, Function.identity());
  }

  /**
   * Returns a {@link Map} based on the given {@link Collection}. The keys are
   * provided by the given mapping function, and the values are the elements of
   * the Collection. 
   * 
   * @param <T> the type of the input elements, and values of the Map
   * @param <K> the output type of the key mapping function
   * 
   * @param c Collection of elements to map
   * @param valueMapper a mapping function to produce values
   * @return a {@code Map} whose keys are the result of applying the given
   *         mapping function to the input elements, and values are as given
   *         by the stream.
   */
  public static <T, K> Map<K, T> keytoIdentity(
      Collection<T> c, Function<? super T, ? extends K> keyMapper) {
    return c.stream().collect(keytoIdentity(keyMapper));
  }
  
  @SafeVarargs
  public static <T> Stream<T> asStream(T... array) {
    return Arrays.asList(array).stream();
  }
}
