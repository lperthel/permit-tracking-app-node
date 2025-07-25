package com.permittrack.permitapi;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Bean;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.utility.DockerImageName;

/**
 * Integration test that connects to a real PostgreSQL container using
 * Testcontainers.
 *
 * This test uses Spring Boot's @ServiceConnection (introduced in 3.1+) to
 * automatically
 * inject container connection properties (JDBC URL, username, password) into
 * the
 * Spring Data JPA configuration. No manual datasource config or YAML overrides
 * are required.
 *
 * Unlike @DataJpaTest, which defaults to H2, this test uses @SpringBootTest to
 * ensure the
 * full application context is loaded and the repository is wired against a real
 * PostgreSQL instance.
 *
 * Benefits:
 * - Simulates real DB behavior (e.g., Postgres constraints, indexing, SQL
 * dialect)
 * - Enables high-fidelity integration testing across environments
 * - Container is isolated, repeatable, and CI-compatible
 *
 * Requires Docker to be running.
 */
@TestConfiguration(proxyBeanMethods = false)
class TestcontainersConfiguration {

	@Bean
	@ServiceConnection
	PostgreSQLContainer<?> postgresContainer() {
		return new PostgreSQLContainer<>(DockerImageName.parse("postgres:latest"));
	}

}
