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
exports.Projectile = void 0;
var kontra_1 = require("kontra");
var Projectile = /** @class */ (function (_super) {
    __extends(Projectile, _super);
    function Projectile(x, y, dx, dy, radius, damage) {
        var _this = _super.call(this, {
            x: x,
            y: y,
            dx: dx,
            dy: dy,
            width: radius * 2,
            height: radius * 2,
            color: 'red',
        }) || this;
        _this.x = x;
        _this.y = y;
        _this.radius = radius;
        _this.damage = damage;
        return _this;
    }
    Projectile.prototype.update = function () {
        this.dy += 0.1; // gravity
        this.advance();
    };
    return Projectile;
}(kontra_1.Sprite));
exports.Projectile = Projectile;
