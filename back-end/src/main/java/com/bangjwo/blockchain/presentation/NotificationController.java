// package com.bangjwo.blockchain.presentation;
//
// import org.springframework.web.bind.annotation.GetMapping;
// import org.springframework.web.bind.annotation.RequestMapping;
// import org.springframework.web.bind.annotation.RestController;
// import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
//
// import com.bangjwo.blockchain.application.service.NotificationService;
//
// import io.swagger.v3.oas.annotations.Operation;
// import lombok.RequiredArgsConstructor;
//
// @RestController
// @RequestMapping("api/v1/notification/")
// @RequiredArgsConstructor
// public class NotificationController {
//
// 	private final NotificationService notificationService;
//
// 	@Operation(
// 		summary = "계약서 진행 상태 조회(사용 여부 미정)",
// 		description = "블록체인에 저장하는 과정에서 어떤 상태인지 SSE로 알려준다.(사용 여부 미정)"
// 	)
// 	@GetMapping("/subscribe")
// 	public SseEmitter subscribe() {
// 		return notificationService.subscribe();
// 	}
// }
