"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Wurm = void 0;
var kontra_1 = require("kontra");
var Wurm = /** @class */ (function (_super) {
    __extends(Wurm, _super);
    function Wurm(x, y, health, color) {
        var _this = _super.call(this, {
            x: x,
            y: y,
            color: color,
            width: 20,
            height: 20,
        }) || this;
        _this.health = health;
        return _this;
    }
    Wurm.prototype.takeDamage = function (amount) {
        this.health -= amount;
        if (this.health < 0) {
            this.health = 0;
        }
    };
    Wurm.prototype.collidesWith = function (projectile) {
        // Simple bounding box collision detection
        return (this.x < projectile.x + projectile.width &&
            this.x + this.width > projectile.x &&
            this.y < projectile.y + projectile.height &&
            this.y + this.height > projectile.y);
    };
    return Wurm;
}(kontra_1.Sprite));
exports.Wurm = Wurm;
