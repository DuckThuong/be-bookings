import { Controller, Get } from "@nestjs/common";

@Controller()
export class AppController {
    @Get()
    public getHello(): any {
        return { message: 'Hello, World!' };
    }
}