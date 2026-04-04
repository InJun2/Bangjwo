package com.bangjwo.room.domain.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.bangjwo.room.domain.entity.Address;
import com.bangjwo.room.domain.entity.Room;

@Repository
public interface AddressRepository extends JpaRepository<Address, Integer> {
	Optional<Address> findByRoom(Room room);

	List<Address> findByRoomRoomIdIn(List<Long> roomIds);

	List<Address> findByRoomIn(List<Room> rooms);
}
