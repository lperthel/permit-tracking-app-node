package com.permittrack.permitapi;

import org.springframework.boot.SpringApplication;

/**
 * Entry point for manually running the Permit API with Testcontainers.
 *
 * This class launches the application using the standard Spring Boot
 * configuration
 * defined in {@link PermitApiApplication}, but overrides the datasource setup
 * by
 * injecting {@link TestcontainersConfiguration}, which provides a
 * PostgreSQLContainer
 * bean annotated with {@code @ServiceConnection}.
 *
 * This enables the application to run against a real PostgreSQL instance in
 * Docker
 * (managed by Testcontainers) without changing application.yaml files or
 * requiring
 * a separate Spring profile.
 *
 * Typical use cases:
 * - Manually debugging service and database behavior against a real Postgres DB
 * - Running the backend locally for frontend integration
 * - Simulating production-like infrastructure during development
 *
 * To run:
 * - Ensure Docker is running
 * - Execute from your IDE or via shell with the built classpath
 *
 * Not intended for use in automated test pipelines — use {@code mvn test} or
 * integration test classes for that.
 */

public class TestPermitApiApplication {

	public static void main(String[] args) {
		SpringApplication.from(PermitApiApplication::main).with(TestcontainersConfiguration.class).run(args);
	}

}
