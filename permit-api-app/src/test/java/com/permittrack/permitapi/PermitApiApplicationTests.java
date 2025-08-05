package com.permittrack.permitapi;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(classes = PermitApiApplication.class)
@ActiveProfiles("test")
class PermitApiApplicationTests {

  @Test
  void contextLoads() {
  }

}
