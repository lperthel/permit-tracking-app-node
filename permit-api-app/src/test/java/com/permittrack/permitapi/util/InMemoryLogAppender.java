package com.permittrack.permitapi.util;

import java.util.ArrayList;
import java.util.List;

import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.AppenderBase;

/**
 * InMemoryLogAppender is a custom Logback appender designed exclusively for
 * testing.
 *
 * <p>
 * This appender captures all log events that occur during a unit or integration
 * test
 * and stores them in memory for later inspection. It allows tests to assert
 * that
 * specific log messages were produced, which is critical for applications that
 * must demonstrate auditability and proper logging practices in government
 * environments.
 *
 * <p>
 * Key behaviors:
 * <ul>
 * <li><b>Test-only usage:</b> This class lives under src/test/java and is never
 * packaged into production artifacts.</li>
 * <li><b>Captures structured logs:</b> Each log event (ILoggingEvent) is stored
 * with level, message,
 * and optional markers/exceptions, allowing fine-grained assertions.</li>
 * <li><b>Supports log verification:</b> Tests can check INFO, WARN, and ERROR
 * messages
 * to ensure proper logging of business events, failures, and warnings
 * (e.g., missing permits, payload too large).</li>
 * <li><b>Reusable across tests:</b> Can be attached to any SLF4J/Logback logger
 * at runtime
 * for temporary log capture.</li>
 * </ul>
 *
 * <p>
 * Typical usage:
 * 
 * <pre>
 * Logger logger = (Logger) LoggerFactory.getLogger(MyService.class);
 * InMemoryLogAppender appender = new InMemoryLogAppender();
 * appender.start();
 * logger.addAppender(appender);
 *
 * // Run code that logs events
 *
 * assertTrue(appender.getEvents().stream()
 *         .anyMatch(event -> event.getFormattedMessage().contains("expected log message")));
 * </pre>
 *
 * <p>
 * After the test, the appender can be stopped or cleared to free resources.
 * This
 * class is a crucial tool for verifying compliance with logging requirements
 * in security-conscious or audit-driven environments.
 */

public class InMemoryLogAppender extends AppenderBase<ILoggingEvent> {
    private final List<ILoggingEvent> logs = new ArrayList<>();

    @Override
    protected void append(ILoggingEvent eventObject) {
        logs.add(eventObject);
    }

    public List<ILoggingEvent> getLogs() {
        return logs;
    }

    /**
     * Utility method to check if a log message containing the given text
     * was logged at the specified level.
     *
     * @param message substring to search for in log messages
     * @param level   log level to match (INFO, WARN, ERROR, etc.)
     * @return true if a log entry with this message and level was found
     */
    public boolean contains(String message, Level level) {
        return logs.stream().anyMatch(
                log -> log.getLevel().equals(level)
                        && log.getFormattedMessage().contains(message));
    }

    public void clear() {
        logs.clear();
    }
}
