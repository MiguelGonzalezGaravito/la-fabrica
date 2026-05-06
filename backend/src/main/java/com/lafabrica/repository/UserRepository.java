package com.lafabrica.repository;

import com.lafabrica.model.entity.User;
import com.lafabrica.model.enums.BusinessType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByBusinessType(BusinessType businessType);
    List<User> findByActive(boolean active);
}
