package com.bangjwo.notification.domain.repository;

import com.bangjwo.notification.domain.entity.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {
	List<Notification> findAllByReceiverIdAndIsReadFalseOrderByCreatedAtDesc(Long receiverId);

	long countByReceiverIdAndIsReadFalse(Long receiverId);
}
