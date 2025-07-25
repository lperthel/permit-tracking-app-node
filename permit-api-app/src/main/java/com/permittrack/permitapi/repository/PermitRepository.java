package com.permittrack.permitapi.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.permittrack.permitapi.model.PermitEntity;

/**
 * Repository interface for performing CRUD operations on Permit entities.
 * 
 * Extends JpaRepository to provide standard methods such as save, findById,
 * findAll, deleteById, and more. This layer abstracts database access logic
 * and allows easy integration with Spring Data JPA.
 */

@Repository
public interface PermitRepository extends JpaRepository<PermitEntity, UUID> {

}
