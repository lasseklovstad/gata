package no.gata.web

import org.springframework.boot.web.servlet.error.ErrorController
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Controller
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.ResponseStatus

@Controller
class RedirectOnResourceNotFoundException : ErrorController {
    @RequestMapping("/error")
    @ResponseStatus(HttpStatus.OK)
    fun redirectOnError(): String {
        return "forward:/"
    }

    @RequestMapping(value = ["/{[path:[^\\.]*}"])
    fun redirect(): String? {
        return "forward:/"
    }
}
