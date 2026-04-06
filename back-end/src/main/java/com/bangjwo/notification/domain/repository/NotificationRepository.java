package com.bangjwo.notification.domain.repository;

import com.bangjwo.notification.domain.entity.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {
	List<Notification> findAllByReceiverIdAndIsReadFalseOrderByCreatedAtDesc(Long receiverId);
	Optional<Notification> findFirstByReceiverIdAndRelatedUrlOrderByCreatedAtDesc(Long receiverId, String relatedUrl);

	long countByReceiverIdAndIsReadFalse(Long receiverId);
}
