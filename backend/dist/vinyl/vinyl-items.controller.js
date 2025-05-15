"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VinylItemsController = void 0;
const common_1 = require("@nestjs/common");
const vinyl_items_service_1 = require("./vinyl-items.service");
const dto_1 = require("./dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const cache_manager_1 = require("@nestjs/cache-manager");
let VinylItemsController = class VinylItemsController {
    constructor(vinylItemsService) {
        this.vinylItemsService = vinylItemsService;
    }
    create(userId, createVinylItemDto) {
        return this.vinylItemsService.create(userId, createVinylItemDto);
    }
    findAll(userId, page, limit, search, status, genre, sortBy, sortOrder, tags, folder) {
        console.log(`Fetching vinyl items for user: ${userId}, page: ${page || 1}, limit: ${limit || 20}, search: ${search}, status: ${status}, genre: ${genre}, sortBy: ${sortBy}, sortOrder: ${sortOrder}, tags: ${tags}, folder: ${folder}`);
        const mappedStatus = status;
        return this.vinylItemsService.findAll(userId, page || 1, limit || 20, search, mappedStatus, genre, sortBy, sortOrder, tags, folder);
    }
    findOne(userId, id) {
        console.log(`Fetching vinyl item ${id} for user: ${userId} - (NEEDS USER AND ITEM SPECIFIC CACHE KEY)`);
        return this.vinylItemsService.findOne(userId, id);
    }
    async update(userId, id, updateVinylItemDto) {
        return this.vinylItemsService.update(userId, id, updateVinylItemDto);
    }
    async remove(userId, id) {
        return this.vinylItemsService.remove(userId, id);
    }
};
exports.VinylItemsController = VinylItemsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.CreateVinylItemDto]),
    __metadata("design:returntype", void 0)
], VinylItemsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseInterceptors)(cache_manager_1.CacheInterceptor),
    (0, cache_manager_1.CacheTTL)(60 * 5 * 1000),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __param(2, (0, common_1.Query)('limit', new common_1.ParseIntPipe({ optional: true }))),
    __param(3, (0, common_1.Query)('search')),
    __param(4, (0, common_1.Query)('status', new common_1.ParseEnumPipe(dto_1.CollectionItemStatusDto, { optional: true }))),
    __param(5, (0, common_1.Query)('genre')),
    __param(6, (0, common_1.Query)('sortBy')),
    __param(7, (0, common_1.Query)('sortOrder')),
    __param(8, (0, common_1.Query)('tags')),
    __param(9, (0, common_1.Query)('folder')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], VinylItemsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseInterceptors)(cache_manager_1.CacheInterceptor),
    (0, cache_manager_1.CacheKey)(`vinyl_item_details`),
    (0, cache_manager_1.CacheTTL)(60 * 10 * 1000),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", void 0)
], VinylItemsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, dto_1.UpdateVinylItemDto]),
    __metadata("design:returntype", Promise)
], VinylItemsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)('userId')),
    __param(1, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], VinylItemsController.prototype, "remove", null);
exports.VinylItemsController = VinylItemsController = __decorate([
    (0, common_1.Controller)('vinyl-items'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [vinyl_items_service_1.VinylItemsService])
], VinylItemsController);
//# sourceMappingURL=vinyl-items.controller.js.map