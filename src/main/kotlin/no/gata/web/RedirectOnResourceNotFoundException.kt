package no.gata.web

import org.springframework.boot.web.servlet.error.ErrorController
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.RequestMapping

@Controller
class RedirectOnResourceNotFoundException : ErrorController {
    @RequestMapping("/error")
    fun redirectOnError(): String {
        return "forward:/"
    }
}
