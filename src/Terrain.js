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
exports.Terrain = void 0;
var kontra_1 = require("kontra");
var Terrain = /** @class */ (function (_super) {
    __extends(Terrain, _super);
    function Terrain(width, height) {
        var _this = _super.call(this, { width: width, height: height }) || this;
        _this.destroy = function (x, y, radius) {
            _this.terrainContext.globalCompositeOperation = 'destination-out';
            _this.terrainContext.beginPath();
            _this.terrainContext.arc(x, y, radius, 0, Math.PI * 2);
            _this.terrainContext.fill();
            _this.terrainContext.globalCompositeOperation = 'source-over';
        };
        _this.isColliding = function (x, y) {
            if (x < 0 || x >= _this.width || y < 0 || y >= _this.height) {
                return false;
            }
            var pixel = _this.terrainContext.getImageData(x, y, 1, 1).data;
            return pixel[3] > 0;
        };
        _this.terrainCanvas = document.createElement('canvas');
        _this.terrainCanvas.width = width;
        _this.terrainCanvas.height = height;
        _this.terrainContext = _this.terrainCanvas.getContext('2d');
        var noiseScale = 0.01;
        var perlin = function (x) {
            // Simple Perlin noise implementation
            var n = 0;
            var a = 1;
            var f = 0.05;
            for (var o = 0; o < 4; o++) {
                n += Math.sin(x * f) * a;
                a *= 0.5;
                f *= 2;
            }
            return n;
        };
        _this.terrainContext.fillStyle = '#8B4513';
        for (var x = 0; x < _this.width; x++) {
            var noiseVal = perlin(x * noiseScale);
            var y = (noiseVal * (_this.height / 4)) + (_this.height / 2);
            _this.terrainContext.fillRect(x, y, 1, _this.height - y);
        }
        return _this;
    }
    Terrain.prototype.draw = function () {
        this.context.drawImage(this.terrainCanvas, 0, 0);
    };
    return Terrain;
}(kontra_1.GameObject));
exports.Terrain = Terrain;
