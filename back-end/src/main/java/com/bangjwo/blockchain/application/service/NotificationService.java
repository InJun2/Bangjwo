// package com.bangjwo.blockchain.application.service;
//
// import java.io.IOException;
// import java.util.concurrent.CopyOnWriteArrayList;
//
// import org.springframework.stereotype.Service;
// import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
//
// @Service
// public class NotificationService {
//
// 	private final CopyOnWriteArrayList<SseEmitter> emitters = new CopyOnWriteArrayList<>();
//
// 	public SseEmitter subscribe() {
// 		SseEmitter emitter = new SseEmitter();
// 		emitter.onCompletion(() -> emitters.remove(emitter));
// 		emitter.onTimeout(() -> emitters.remove(emitter));
// 		emitters.add(emitter);
// 		return emitter;
// 	}
//
// 	public void notifyClients(String message) {
// 		for (SseEmitter emitter : emitters) {
// 			try {
// 				emitter.send(SseEmitter.event().name("txStatus").data(message));
// 			} catch (IOException e) {
// 				emitter.completeWithError(e);
// 				emitters.remove(emitter);
// 			}
// 		}
// 	}
// }
