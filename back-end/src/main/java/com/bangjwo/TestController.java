package com.bangjwo;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.bangjwo.auth.resolver.MemberHeader;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

@RestController
public class TestController {
	@GetMapping
	public String test() {
		return "bangjwo-service (테스트)";
	}

	@Operation(summary = "테스트 컨트롤러", security = @SecurityRequirement(name = "JWT"))
	@GetMapping("/test")
	public ResponseEntity<String> test2(@MemberHeader Long memberId) {
		return ResponseEntity.ok("Current memberId: " + memberId);
	}
}