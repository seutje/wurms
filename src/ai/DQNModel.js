"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DQNModel = void 0;
var tf = require("@tensorflow/tfjs");
var DQNModel = /** @class */ (function () {
    function DQNModel(inputShape, outputSize) {
        this.inputShape = inputShape;
        this.outputSize = outputSize;
        this.model = this.buildModel();
    }
    DQNModel.prototype.buildModel = function () {
        var model = tf.sequential();
        model.add(tf.layers.dense({ units: 64, activation: 'relu', inputShape: this.inputShape }));
        model.add(tf.layers.dense({ units: 64, activation: 'relu' }));
        model.add(tf.layers.dense({ units: this.outputSize })); // Output for Q-values
        model.compile({ optimizer: tf.train.adam(), loss: 'meanSquaredError' });
        return model;
    };
    DQNModel.prototype.predict = function (observation) {
        // Flatten the observation into a single array for the neural network input
        var flatObservation = __spreadArray([
            observation.playerWurmX,
            observation.playerWurmY,
            observation.playerWurmHealth,
            observation.aiWurmX,
            observation.aiWurmY,
            observation.aiWurmHealth
        ], observation.terrainHeights, true);
        var inputTensor = tf.tensor2d([flatObservation], [1, this.inputShape[0]]);
        return this.model.predict(inputTensor);
    };
    DQNModel.prototype.train = function (input, target) {
        return this.model.fit(input, target);
    };
    DQNModel.prototype.save = function (path) {
        return this.model.save(path);
    };
    DQNModel.load = function (path) {
        return __awaiter(this, void 0, void 0, function () {
            var loadedModel, inputShape, outputSize, dqnModel;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, tf.loadLayersModel(path)];
                    case 1:
                        loadedModel = _a.sent();
                        inputShape = loadedModel.layers[0].input.shape.slice(1);
                        outputSize = loadedModel.layers[loadedModel.layers.length - 1].units;
                        dqnModel = new DQNModel(inputShape, outputSize);
                        dqnModel.model = loadedModel;
                        return [2 /*return*/, dqnModel];
                }
            });
        });
    };
    return DQNModel;
}());
exports.DQNModel = DQNModel;
