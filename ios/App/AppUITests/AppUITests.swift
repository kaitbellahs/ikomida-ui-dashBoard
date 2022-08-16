//
//  AppUITests.swift
//  AppUITests
//
//  Created by khalid ait bellahs on 16/08/22.
//

import XCTest

class AppUITests: XCTestCase {

    override func setUpWithError() throws {
        // Put setup code here. This method is called before the invocation of each test method in the class.

        // In UI tests it is usually best to stop immediately when a failure occurs.
        continueAfterFailure = false

        // In UI tests it’s important to set the initial state - such as interface orientation - required for your tests before they run. The setUp method is a good place to do this.
    }

    override func tearDownWithError() throws {
        // Put teardown code here. This method is called after the invocation of each test method in the class.
    }

    func testExample() throws {
        // UI tests must launch the application that they test.
        let app = XCUIApplication()
        app.launch()
        print(app.buttons)
        let webPageTitle = app.staticTexts["iKomida - Dashboard"]
        XCTAssert(webPageTitle.waitForExistence(timeout: 5))
        let produtos = app.buttons["Produtos"]
        XCTAssert(produtos.waitForExistence(timeout: 5))
        produtos.tap()
        let newProduto = app.buttons["NOVO PRODUTO"]
        XCTAssert(newProduto.waitForExistence(timeout: 5))
        newProduto.tap()
        let upload = app.buttons["upload"]
        XCTAssert(upload.waitForExistence(timeout: 5))
        XCTAssert(upload.isHittable)
        upload.tap()
        let takePhoto = app.buttons["Take Photo"]
        XCTAssert(takePhoto.waitForExistence(timeout: 5))
        XCTAssert(takePhoto.isHittable)
        takePhoto.click()
        let camera = app.staticTexts["PHOTO"]
        XCTAssert(camera.waitForExistence(timeout: 5))
        let photoLibrary = app.buttons["Photo Library"]
        XCTAssert(photoLibrary.waitForExistence(timeout: 5))
        XCTAssert(photoLibrary.isHittable)
        photoLibrary.click()

        // Use recording to get started writing UI tests.
        // Use XCTAssert and related functions to verify your tests produce the correct results.
    }

    func testLaunchPerformance() throws {
        if #available(macOS 10.15, iOS 13.0, tvOS 13.0, watchOS 7.0, *) {
            // This measures how long it takes to launch your application.
            measure(metrics: [XCTApplicationLaunchMetric()]) {
                XCUIApplication().launch()
            }
        }
    }
}
