package no.gata.backend

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping('api/user')
class UserController {

    @GetMapping
    List<User> getAllUsers(){
        User mockUser = new User()
        mockUser.name = "Lasse Kløvstad"
        return [mockUser];
    }
}
