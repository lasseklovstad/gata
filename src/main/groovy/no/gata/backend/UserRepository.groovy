package no.gata.backend

import org.springframework.data.repository.CrudRepository

interface UserRepository extends CrudRepository<User,UUID> {
    List<User> findAll();
}
