package com.permittrack.permitapi;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;

@Import(TestcontainersConfiguration.class)
@SpringBootTest(classes = PermitApiApplication.class)
class PermitApiApplicationTests {

	@Test
	void contextLoads() {
	}

}
